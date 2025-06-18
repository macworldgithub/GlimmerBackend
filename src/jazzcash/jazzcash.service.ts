import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as crypto from 'crypto';
import { Model } from 'mongoose';
import { CreateOrderDto } from 'src/order/dtos/req_dtos/order';
import { Order, OrderDocument } from 'src/schemas/ecommerce/order.schema';
import {
  Transaction,
  TransactionDocument,
} from 'src/schemas/transactions/transaction.schema';

@Injectable()
export class JazzcashService {
  constructor(
    @InjectModel(Order.name) private readonly orderModel: Model<OrderDocument>,
    @InjectModel(Transaction.name)
    private readonly transactionModel: Model<TransactionDocument>,
  ) {}

  private generatePaymentHash(
    params: Record<string, any>,
    integritySalt: string,
  ): string {
    const orderedKeys = [
      'pp_Amount',
      'pp_BillReference',
      'pp_Description',
      'pp_Language',
      'pp_MerchantID',
      'pp_Password',
      'pp_ReturnURL',
      'pp_TxnCurrency',
      'pp_TxnDateTime',
      'pp_TxnExpiryDateTime',
      'pp_TxnRefNo',
      'pp_TxnType',
      'pp_Version',
      'pp_PosEntryMode',
      'pp_MobileNumber',
      'pp_CNIC',
      'ppmpf_1',
      'ppmpf_2',
      'ppmpf_3',
      'ppmpf_4',
      'ppmpf_5',
    ];

    const rawString = orderedKeys.map((key) => params[key] || '').join('&');
    const stringToHash = integritySalt + '&' + rawString;

    return crypto
      .createHmac('sha256', integritySalt)
      .update(stringToHash)
      .digest('hex');
  }

  async createOrderAndInitiatePayment(orderDto: CreateOrderDto) {
    const {
      customerEmail,
      discountedTotal,
      customerName,
      ShippingInfo,
      productList,
      total,
      payment,
    } = orderDto;

    const transaction = await this.transactionModel.create({
      transactionId: payment.transactionId || `JAZZ-${Date.now()}`,
      customerEmail,
      amount: discountedTotal.toString(),
      currency: 'PKR',
      status: 'Pending',
      paymentGateway: 'JazzCash',
    });

    const order = await this.orderModel.create({
      ShippingInfo,
      customerName,
      customerEmail,
      productList,
      total,
      discountedTotal,
      transaction: transaction._id,
    });

    const merchantId = 'MC157333';
    const password = 'd5vz0zx2ya';
    const integritySalt = '1z054y2ssy';
    const returnUrl = process.env.JAZZCASH_RETURN_URL;

    const txnDateTime = new Date()
      .toISOString()
      .replace(/[-:.TZ]/g, '')
      .slice(0, 14);

    const txnExpiryDateTime = new Date(Date.now() + 30 * 60000)
      .toISOString()
      .replace(/[-:.TZ]/g, '')
      .slice(0, 14);

    const params = {
      pp_Version: '1.1',
      pp_TxnType: 'MPAY',
      pp_Language: 'EN',
      pp_MerchantID: merchantId,
      pp_Password: password,
      pp_TxnRefNo: transaction.transactionId,
      pp_Amount: (discountedTotal * 100).toString(), // paisa
      pp_TxnCurrency: 'PKR',
      pp_TxnDateTime: txnDateTime,
      pp_TxnExpiryDateTime: txnExpiryDateTime,
      pp_BillReference: 'billRef',
      pp_Description: 'Payment for order',
      pp_ReturnURL: returnUrl,
      pp_PosEntryMode: '1',
      pp_MobileNumber: '03001234567', // ← required for MWALLET
      pp_CNIC: '4250156667561', // ← required for MWALLET
    };

    //@ts-ignore
    const pp_SecureHash = this.generatePaymentHash(params, integritySalt);

    return {
      paymentParams: {
        ...params,
        pp_SecureHash,
      },
      redirectUrl:
        'https://sandbox.jazzcash.com.pk/CustomerPortal/transactionmanagement/merchantform/',
      message: 'Redirect to JazzCash for payment',
    };
  }

  async updateTransactionStatus(
    txnRefNo: string, // your internal txnRef (e.g. `JAZZ-<timestamp>`)
    transactionID: string, // real JazzCash transaction ID from frontend
    status: 'Success' | 'Failed',
  ) {
    const txn = await this.transactionModel.findOneAndUpdate(
      { transactionId: txnRefNo }, // find by your original internal ID
      {
        status, // update status
        transactionId: transactionID, // replace with actual JazzCash txn ID
      },
      { new: true },
    );

    if (!txn) {
      throw new NotFoundException('Transaction not found');
    }

    return {
      message: `Transaction updated to ${status}`,
      transaction: txn,
    };
  }

  async handleCallback(query: any) {
    const { pp_TxnRefNo, pp_ResponseCode, pp_TransactionID } = query;

    if (pp_ResponseCode === '000') {
      this.updateTransactionStatus(pp_TxnRefNo, pp_TransactionID, 'Success');
      return { status: 'success', message: 'Payment confirmed' };
    } else {
      this.updateTransactionStatus(pp_TxnRefNo, pp_TransactionID, 'Failed');
      return { status: 'failed', message: 'Payment failed' };
    }
  }
}
