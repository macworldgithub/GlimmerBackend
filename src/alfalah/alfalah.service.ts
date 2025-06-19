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

  async createPaymentAndOrder(orderDto: CreateOrderDto) {
    const {
      customerName,
      customerEmail,
      ShippingInfo,
      productList,
      total,
      discountedTotal,
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
      paymentGateway: 'Alfalah',
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

    //@ts-ignore
    const alfalahOrderId = order._id.toString();

    const url = `https://${this.host}/api/rest/version/100/merchant/${this.merchantId}/session`;

    const body = {
      apiOperation: 'INITIATE_CHECKOUT',
      checkoutMode: 'WEBSITE',
      interaction: {
        operation: 'PURCHASE',
        merchant: {
          name: 'Laila',
          url: 'https://www.glimmer.com.pk',
        },
        returnUrl: `https://www.api.glimmer.com.pk/alfalah/callback?orderId=${order._id}`,
      },
      order: {
        currency: 'PKR',
        amount: discountedTotal.toFixed(2),
        id: alfalahOrderId,
        description: 'Product Purchase',
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

    // You can store `alfalahOrderId`, `successIndicator` in the transaction if needed
    await transaction.updateOne({
      gatewayOrderId: alfalahOrderId,
      gatewaySessionId: data.session.id,
      successIndicator: data.successIndicator,
    });

    return {
      redirectUrl: `https://${this.host}/checkout/version/100/merchant/${this.merchantId}/session/${data.session.id}`,
      alfalahOrderId,
      sessionId: data.session.id,
    };
  }

  async verifyAndFinalize(orderMongoId: string) {
    // 1. Find the order with its linked transaction
    const order = (await this.orderModel
      .findById(orderMongoId)
      .populate('transaction')) as Order & { transaction: Transaction };

    if (!order) {
      return { success: false, reason: 'Order not found' };
    }

    const transaction = order.transaction;
    const gatewayOrderId = order?.transaction?.gatewayOrderId;

    // 2. Ensure the transaction has an Alfalah order ID
    if (!gatewayOrderId) {
      return {
        success: false,
        reason: 'Missing gateway order ID on transaction',
      };
    }

    const url = `https://${this.host}/api/rest/version/100/merchant/${this.merchantId}/order/${gatewayOrderId}`;
    const auth = Buffer.from(
      `merchant.${this.merchantId}:${this.password}`,
    ).toString('base64');

    try {
      // 3. Call Alfalah API to verify payment status
      const { data } = await this.http.axiosRef.get(url, {
        headers: {
          Authorization: `Basic ${auth}`,
        },
      });

      const tx = data.transaction?.[0];
      const approved = tx?.response?.gatewayCode === 'APPROVED';

      if (approved) {
        const realTransactionId = tx.transaction?.id || 'UNKNOWN';

        // 4. Update the transaction with success & real transaction ID
        //@ts-ignore
        await this.transactionModel.findByIdAndUpdate(transaction._id, {
          status: 'Success',
          realTransactionId,
          transactionId: realTransactionId, // Replace your fake ID
        });

        return { order, transaction };
      } else {
        // 5. Payment failed — delete both order & transaction
        await Promise.all([
          //@ts-ignore
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
        error: error.message,
      };
    }
  }
}
