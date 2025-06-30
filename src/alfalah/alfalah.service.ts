import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateOrderDto } from 'src/order/dtos/req_dtos/order';
import { Order, OrderDocument } from 'src/schemas/ecommerce/order.schema';
import {
  Transaction,
  TransactionDocument,
} from 'src/schemas/transactions/transaction.schema';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AlfalahService {
  private readonly host: any;
  private readonly merchantId: any;
  private readonly password: any;

  constructor(
    private readonly config: ConfigService,

    private readonly http: HttpService,
    @InjectModel(Order.name) private readonly orderModel: Model<OrderDocument>,
    @InjectModel(Transaction.name)
    private readonly transactionModel: Model<TransactionDocument>,
  ) {
    this.host = this.config.get<string>('GATEWAY_HOST');
    this.merchantId = this.config.get<string>('MERCHANT_ID');
    this.password = this.config.get<string>('API_PASSWORD');
  }

  async createOrderAndInitiateAlfalahPayment(orderDto: any) {
    const {
      customerEmail,
      discountedTotal,
      customerName,
      ShippingInfo,
      productList,
      total,
    } = orderDto;

    // Step 1: Generate gateway orderId
    const gatewayOrderId = `ORDER-${Date.now()}`;

    // Step 2: Create DB transaction
    const transaction = await this.transactionModel.create({
      transactionId: gatewayOrderId, // or generateTransactionId() if needed separately
      customerEmail,
      amount: discountedTotal.toString(),
      currency: 'PKR',
      status: 'Pending',
      paymentGateway: 'Bank Alfalah',
      gatewayOrderId,
    });

    // Step 3: Create DB order
    const order = await this.orderModel.create({
      ShippingInfo,
      customerName,
      customerEmail,
      productList,
      total,
      discountedTotal,
      transaction: transaction._id,
      gatewayOrderId,
    });

    // Step 4: Prepare Alfalah session request
    const url = `https://${this.host}/api/rest/version/72/merchant/${this.merchantId}/session`;

    const body = {
      apiOperation: 'INITIATE_CHECKOUT',
      interaction: {
        operation: 'PURCHASE',
        returnUrl: `http://localhost:3000/alfalah/callback?orderId=${order._id}`,
        merchant: {
          name: 'Glimmer Store',
          url: 'https://www.glimmer.com.pk',
        },
      },
      order: {
        currency: 'PKR',
        amount: discountedTotal.toFixed(2),
        id: order._id,
        description: 'Glimmer product purchase',
      },
    };

    const auth = Buffer.from(
      `merchant.${this.merchantId}:${this.password}`,
    ).toString('base64');

    const { data } = await this.http.axiosRef.post(url, body, {
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
    });

    // Step 5: Return session info to frontend
    return {
      sessionId: data.session.id,
      gatewayOrderId,
      message: 'Redirect to Bank Alfalah checkout page',
    };
  }

  async verifyAndFinalize(OrderId: string) {
    const order = await this.orderModel
      .findById(OrderId) // or .findOne({ _id: OrderId })
      .populate('transaction');

    if (!order || !order.transaction) {
      return { success: false, reason: 'Order or transaction not found' };
    }

    const transaction = order.transaction;

    const url = `https://${this.host}/api/rest/version/72/merchant/${this.merchantId}/order/${OrderId}`;
    const auth = Buffer.from(
      `merchant.${this.merchantId}:${this.password}`,
    ).toString('base64');

    try {
      const { data } = await this.http.axiosRef.get(url, {
        headers: { Authorization: `Basic ${auth}` },
      });

      const tx = data?.transaction?.[0];

      if (!tx) {
        return {
          success: false,
          reason: 'No transaction data returned from gateway',
        };
      }

      const isApproved = tx.response?.gatewayCode === 'APPROVED';

      if (isApproved) {
        const realTransactionId = tx.transaction?.id || 'UNKNOWN';

        //@ts-ignore
        await this.transactionModel.findByIdAndUpdate(transaction._id, {
          status: 'Success',
          realTransactionId,
          transactionId: realTransactionId,
        });

        return { success: true, order, transaction };
      } else {
        await Promise.all([
          this.orderModel.findByIdAndDelete(order._id),
          //@ts-ignore
          this.transactionModel.findByIdAndDelete(transaction._id),
        ]);

        return { success: false, reason: 'Payment not approved' };
      }
    } catch (error: any) {
      return {
        success: false,
        reason: 'Payment verification failed',
        error: error.message || 'Unknown error',
      };
    }
  }
}
