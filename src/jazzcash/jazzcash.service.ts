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

  private generatePaymentHash(params: Record<string, any>): string {
    const {
      pp_Amount,
      pp_BillReference,
      pp_MerchantID,
      pp_PosEntryMode,
      pp_TxnRefNo,
      pp_TxnCurrency,
      pp_TxnDateTime,
      pp_Version,
      pp_Language,
      pp_ReturnURL,
      pp_SecureHashSecret,
    } = params;

    const rawString =
      pp_SecureHashSecret +
      '&' +
      pp_Amount +
      '&' +
      pp_BillReference +
      '&' +
      pp_MerchantID +
      '&' +
      pp_PosEntryMode +
      '&' +
      pp_TxnRefNo +
      '&' +
      pp_TxnCurrency +
      '&' +
      pp_TxnDateTime +
      '&' +
      pp_Version +
      '&' +
      pp_Language +
      '&' +
      pp_ReturnURL;

    return crypto
      .createHmac('sha256', pp_SecureHashSecret)
      .update(rawString)
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

    // 1. Create Transaction
    const transaction = await this.transactionModel.create({
      transactionId: payment.transactionId || `JAZZ-${Date.now()}`,
      customerEmail,
      amount: discountedTotal.toString(),
      currency: 'PKR',
      status: 'Pending', // status pending before payment
      paymentGateway: 'JazzCash',
    });

    // 2. Create Order
    const order = await this.orderModel.create({
      ShippingInfo,
      customerName,
      customerEmail,
      productList,
      total,
      discountedTotal,
      transaction: transaction._id,
    });

    // 4. Prepare Payment Params
    const merchantId = process.env.JAZZCASH_MERCHANT_ID;
    const password = process.env.JAZZCASH_PASSWORD;
    const integritySalt = process.env.JAZZCASH_INTEGRITY_SALT;
    const returnUrl = process.env.JAZZCASH_RETURN_URL;

    const txnExpiryDateTime = new Date(Date.now() + 30 * 60 * 1000) // 30 minutes later
      .toISOString()
      .replace(/[-:.TZ]/g, '')
      .slice(0, 14);

    const txnDateTime = new Date()
      .toISOString()
      .replace(/[-:.TZ]/g, '')
      .slice(0, 14); // yyyyMMddHHmmss

    const params = {
      pp_TxnType: 'MPAY',
      pp_Version: '1.1',
      pp_TxnCurrency: 'PKR',
      pp_TxnDateTime: txnDateTime,
      pp_MerchantID: merchantId,
      pp_Password: password,
      pp_TxnRefNo: transaction.transactionId, // transaction ID here
      pp_Amount: (discountedTotal * 100).toString(), // in paisa
      pp_BillReference: 'billRef',
      pp_Description: 'Order Payment',
      pp_TxnExpiryDateTime: txnExpiryDateTime,
      pp_ReturnURL: returnUrl,
      pp_Language: 'EN',

      pp_PosEntryMode: '1',
    };

    // 5. Generate Secure Hash
    const pp_SecureHash = this.generatePaymentHash(params);

    return {
      paymentParams: {
        ...params,
        pp_SecureHash,
      },
      message: 'Order created and JazzCash payment initiated.',
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
