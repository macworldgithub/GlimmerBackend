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
    // 1. Filter and sort all pp_ keys (except pp_SecureHash)
    const sortedKeys = Object.keys(params)
      .filter((key) => key.startsWith('pp_') && key !== 'pp_SecureHash')
      .sort();

    // 2. Build the string to hash
    const paramString = sortedKeys
      .map((key) => `${params[key] || ''}`)
      .join('&');
    const stringToHash = `${integritySalt}&${paramString}`;

    // 3. Create HMAC SHA256 hash
    const hash = crypto
      .createHmac('sha256', integritySalt)
      .update(stringToHash)
      .digest('hex')
      .toUpperCase(); // ✅ Convert to uppercase

    return hash;
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

    const generateTransactionId = () => {
      const now = new Date();
      const pad = (n: number) => n.toString().padStart(2, '0');

      const year = now.getFullYear();
      const month = pad(now.getMonth() + 1);
      const day = pad(now.getDate());
      const hours = pad(now.getHours());
      const minutes = pad(now.getMinutes());
      const seconds = pad(now.getSeconds());

      return `T${year}${month}${day}${hours}${minutes}${seconds}`;
    };

    const transactionId = generateTransactionId();

    const transaction = await this.transactionModel.create({
      transactionId,
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
      pp_TxnType: 'MWALLET',
      pp_Language: 'EN',
      pp_MerchantID: merchantId,
      pp_Password: password,
      pp_TxnRefNo: transaction.transactionId,
      pp_Amount: (discountedTotal * 100).toString(), // paisa
      pp_TxnCurrency: 'PKR',
      pp_TxnDateTime: txnDateTime,

      pp_TranExpiryDateTime: txnExpiryDateTime,
      //@ts-ignore
      pp_BillReference: order._id.toString(),
      pp_Description: 'Payment for order',
      pp_ReturnURL: returnUrl,
      pp_PosEntryMode: '1',
      pp_MobileNumber: '03149856502', // ← required for MWALLET
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

  async handleCallback(body: any) {
    const { pp_TxnRefNo, pp_ResponseCode, pp_TransactionID } = body;

    if (pp_ResponseCode === '000') {
      await this.updateTransactionStatus(
        pp_TxnRefNo,
        pp_TransactionID,
        'Success',
      );
      return { status: 'success', message: 'Payment confirmed' };
    } else {
      await this.updateTransactionStatus(
        pp_TxnRefNo,
        pp_TransactionID,
        'Failed',
      );
      return { status: 'failed', message: 'Payment failed' };
    }
  }
}
