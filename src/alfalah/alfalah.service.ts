// import { Injectable } from '@nestjs/common';
// import { InjectModel } from '@nestjs/mongoose';
// import { Model } from 'mongoose';
// import { CreateOrderDto } from 'src/order/dtos/req_dtos/order';
// import { Order, OrderDocument } from 'src/schemas/ecommerce/order.schema';
// import {
//   Transaction,
//   TransactionDocument,
// } from 'src/schemas/transactions/transaction.schema';
// import { HttpService } from '@nestjs/axios';
// import { ConfigService } from '@nestjs/config';

// @Injectable()
// export class AlfalahService {
//   private readonly host: any;
//   private readonly merchantId: any;
//   private readonly password: any;

//   constructor(
//     private readonly config: ConfigService,

//     private readonly http: HttpService,
//     @InjectModel(Order.name) private readonly orderModel: Model<OrderDocument>,
//     @InjectModel(Transaction.name)
//     private readonly transactionModel: Model<TransactionDocument>,
//   ) {
//     this.host = this.config.get<string>('GATEWAY_HOST');
//     this.merchantId = this.config.get<string>('MERCHANT_ID');
//     this.password = this.config.get<string>('API_PASSWORD');
//   }

//   async createOrderAndInitiateAlfalahPayment(orderDto: any) {
//     const {
//       customerEmail,
//       discountedTotal,
//       customerName,
//       ShippingInfo,
//       productList,
//       total,
//     } = orderDto;

//     // Step 1: Generate gateway orderId
//     const gatewayOrderId = `ORDER-${Date.now()}`;

//     // Step 2: Create DB transaction
//     const transaction = await this.transactionModel.create({
//       transactionId: gatewayOrderId, // or generateTransactionId() if needed separately
//       customerEmail,
//       amount: discountedTotal.toString(),
//       currency: 'PKR',
//       status: 'Pending',
//       paymentGateway: 'Bank Alfalah',
//       gatewayOrderId,
//     });

//     // Step 3: Create DB order
//     const order = await this.orderModel.create({
//       ShippingInfo,
//       customerName,
//       customerEmail,
//       productList,
//       total,
//       discountedTotal,
//       transaction: transaction._id,
//       gatewayOrderId,
//     });
//     console.log("order",order)
//     // Step 4: Prepare Alfalah session request
//     const url = `https://${this.host}/api/rest/version/72/merchant/${this.merchantId}/session`;

//     const body = {
//       apiOperation: 'INITIATE_CHECKOUT',
//       interaction: {
//         operation: 'PURCHASE',
//         returnUrl: `https://www.api.glimmer.com.pk/alfalah/callback?orderId=${order._id}`,
//         merchant: {
//           name: 'Glimmer Store',
//           url: 'https://www.glimmer.com.pk',
//         },
//       },
//       order: {
//         currency: 'PKR',
//         amount: discountedTotal.toFixed(2),
//         id: order._id,
//         description: 'Glimmer product purchase',
//       },
//     };

//     const auth = Buffer.from(
//       `merchant.${this.merchantId}:${this.password}`,
//     ).toString('base64');
//     console.log("auth",auth)
//     console.log("Now calling:",url)
//     const { data } = await this.http.axiosRef.post(url, body, {
//       headers: {
//         Authorization: `Basic ${auth}`,
//         'Content-Type': 'application/json',
//       },
//     });
//     console.log(data)
//     // Step 5: Return session info to frontend
//     return {
//       sessionId: data.session.id,
//       gatewayOrderId,
//       message: 'Redirect to Bank Alfalah checkout page',
//     };
//   }

//   async verifyAndFinalize(OrderId: string) {
//     const order = await this.orderModel
//       .findById(OrderId) // or .findOne({ _id: OrderId })
//       .populate('transaction');

//     if (!order || !order.transaction) {
//       return { success: false, reason: 'Order or transaction not found' };
//     }

//     const transaction = order.transaction;

//     const url = `https://${this.host}/api/rest/version/72/merchant/${this.merchantId}/order/${OrderId}`;
//     const auth = Buffer.from(
//       `merchant.${this.merchantId}:${this.password}`,
//     ).toString('base64');

//     try {
//       const { data } = await this.http.axiosRef.get(url, {
//         headers: { Authorization: `Basic ${auth}` },
//       });

//       const tx = data?.transaction?.[0];

//       if (!tx) {
//         return {
//           success: false,
//           reason: 'No transaction data returned from gateway',
//         };
//       }

//       const isApproved = tx.response?.gatewayCode === 'APPROVED';

//       if (isApproved) {
//         const realTransactionId = tx.transaction?.id || 'UNKNOWN';

//         //@ts-ignore
//         await this.transactionModel.findByIdAndUpdate(transaction._id, {
//           status: 'Success',
//           realTransactionId,
//           transactionId: realTransactionId,
//         });

//         return { success: true, order, transaction };
//       } else {
//         await Promise.all([
//           this.orderModel.findByIdAndDelete(order._id),
//           //@ts-ignore
//           this.transactionModel.findByIdAndDelete(transaction._id),
//         ]);

//         return { success: false, reason: 'Payment not approved' };
//       }
//     } catch (error: any) {
//       return {
//         success: false,
//         reason: 'Payment verification failed',
//         error: error.message || 'Unknown error',
//       };
//     }
//   }
// }
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateOrderDto } from 'src/order/dtos/req_dtos/order';
import { Order, OrderDocument } from 'src/schemas/ecommerce/order.schema';
import {
  Transaction,
  TransactionDocument,
} from 'src/schemas/transactions/transaction.schema';
import { NotificationService } from 'src/notification/notification.service';
import { OrderGateway } from 'src/order/order.gateway';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import * as crypto from 'crypto';
import {
  SalonServiceBooking,
  SalonServiceBookingDocument,
} from 'src/schemas/salon/salon_service_booking.schema';
import {
  BookingTransaction,
  BookingTransactionDocument,
} from 'src/schemas/transactions/booking-transaction.schema';
import { BookingGateway } from 'src/salon_service_booking/salon_service_booking_gateway';

@Injectable()
export class AlfalahService {
  private readonly host: string;
  private readonly merchantId: string;
  private readonly key1: string;
  private readonly key2: string;
  private readonly merchantConfig: any;

  constructor(
    private readonly config: ConfigService,
    private readonly http: HttpService,
    private readonly notificationService: NotificationService,
    private readonly orderGateway: OrderGateway,
    private readonly bookingGateway: BookingGateway,
    @InjectModel(Order.name) private readonly orderModel: Model<OrderDocument>,
    @InjectModel(Transaction.name)
    private readonly transactionModel: Model<TransactionDocument>,
    @InjectModel(SalonServiceBooking.name)
    private readonly bookingModel: Model<SalonServiceBookingDocument>,
    @InjectModel(BookingTransaction.name)
    private readonly bookingTransactionModel: Model<BookingTransactionDocument>,
  ) {
    this.host = this.config.get<string>('GATEWAY_HOST')!;
    this.merchantId = this.config.get<string>('MERCHANT_ID')!;
    this.key1 = this.config.get<string>('KEY1')!;
    this.key2 = this.config.get<string>('KEY2')!;

    this.merchantConfig = {
      HS_ChannelId: '1001',
      HS_MerchantId: this.merchantId,
      HS_StoreId: '219388',
      HS_ReturnURL: 'https://glimmer.com.pk',
      HS_MerchantHash: 'OUU362MB1upgLnmraQiccsEIyBwunn1+IcQVepQAuBI=',
      HS_MerchantUsername: 'owovuj',
      HS_MerchantPassword: 'aCsEece69v5vFzk4yqF7CA==',
    };
  }

  private encryptAES(mapString: string): string {
    try {
      const cipher = crypto.createCipheriv('aes-128-cbc', this.key1, this.key2);
      let encrypted = cipher.update(mapString, 'utf8', 'base64');
      encrypted += cipher.final('base64');
      return encrypted;
    } catch (err) {
      console.error('Encryption error:');
      throw err;
    }
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
      transactionId: gatewayOrderId,
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

    // Step 4: Prepare Bank Alfalah handshake request
    const mapString =
      `HS_ChannelId=${this.merchantConfig.HS_ChannelId}` +
      `&HS_IsRedirectionRequest=0` +
      `&HS_MerchantId=${this.merchantConfig.HS_MerchantId}` +
      `&HS_StoreId=${this.merchantConfig.HS_StoreId}` +
      `&HS_ReturnURL=${this.merchantConfig.HS_ReturnURL}` +
      `&HS_MerchantHash=${this.merchantConfig.HS_MerchantHash}` +
      `&HS_MerchantUsername=${this.merchantConfig.HS_MerchantUsername}` +
      `&HS_MerchantPassword=${this.merchantConfig.HS_MerchantPassword}` +
      `&HS_TransactionReferenceNumber=${gatewayOrderId}`;

    const hashRequest = this.encryptAES(mapString);

    const url = `https://${this.host}/HS/HS/HS`;
    const handshakeResponse = await firstValueFrom(
      this.http.post(
        url,
        new URLSearchParams({
          HS_ChannelId: this.merchantConfig.HS_ChannelId,
          HS_IsRedirectionRequest: '0',
          HS_MerchantId: this.merchantConfig.HS_MerchantId,
          HS_StoreId: this.merchantConfig.HS_StoreId,
          HS_ReturnURL: this.merchantConfig.HS_ReturnURL,
          HS_MerchantHash: this.merchantConfig.HS_MerchantHash,
          HS_MerchantUsername: this.merchantConfig.HS_MerchantUsername,
          HS_MerchantPassword: this.merchantConfig.HS_MerchantPassword,
          HS_TransactionReferenceNumber: gatewayOrderId,
          HS_RequestHash: hashRequest,
        }).toString(),
        {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        },
      ),
    );

    const authToken = handshakeResponse.data.AuthToken;
    if (!authToken) {
      throw new Error('Failed to retrieve AuthToken from handshake response');
    }

    // Step 5: Prepare SSO form
    const mapStringSSO =
      `AuthToken=${authToken}` +
      `&RequestHash=` +
      `&ChannelId=${this.merchantConfig.HS_ChannelId}` +
      `&Currency=PKR` +
      `&IsBIN=0` +
      `&ReturnURL=${this.merchantConfig.HS_ReturnURL}` +
      `&MerchantId=${this.merchantConfig.HS_MerchantId}` +
      `&StoreId=${this.merchantConfig.HS_StoreId}` +
      `&MerchantHash=${this.merchantConfig.HS_MerchantHash}` +
      `&MerchantUsername=${this.merchantConfig.HS_MerchantUsername}` +
      `&MerchantPassword=${this.merchantConfig.HS_MerchantPassword}` +
      `&TransactionTypeId=3` +
      `&TransactionReferenceNumber=${gatewayOrderId}` +
      `&TransactionAmount=${discountedTotal.toFixed(2)}`;

    const requestHashSSO = this.encryptAES(mapStringSSO);
    //Notification sending code
    const message = `A new order has been placed by ${order.customerName}. Please review and process it. Order ID: ${order._id}`;
    const userId = order.productList?.[0]?.storeId;

    if (!userId) {
      console.warn('No storeId found in order.productList');
    }
    console.log('sending notification');
    await this.notificationService.create(userId, message, order);

    this.orderGateway.sendOrderNotification(order);
    // Step 6: Return HTML form for auto-submission
    console.log('notification sent');
    return `
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Bank Alfalah Payment Redirect</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
              margin: 0;
              background-color: #f4f4f4;
            }
            .container {
              text-align: center;
            }
            .loader {
              border: 4px solid #f3f3f3;
              border-top: 4px solid #3498db;
              border-radius: 50%;
              width: 40px;
              height: 40px;
              animation: spin 1s linear infinite;
              margin: 20px auto;
            }
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h2>Initiating Payment...</h2>
            <p>Please wait while we redirect you to Bank Alfalah's payment page.</p>
            <div class="loader"></div>
          </div>
          <form id="ssoForm" action="https://${this.host}/SSO/SSO/SSO" method="post">
            <input type="hidden" name="AuthToken" value="${authToken}" />
            <input type="hidden" name="RequestHash" value="${requestHashSSO}" />
            <input type="hidden" name="ChannelId" value="${this.merchantConfig.HS_ChannelId}" />
            <input type="hidden" name="Currency" value="PKR" />
            <input type="hidden" name="IsBIN" value="0" />
            <input type="hidden" name="ReturnURL" value="${this.merchantConfig.HS_ReturnURL}" />
            <input type="hidden" name="MerchantId" value="${this.merchantConfig.HS_MerchantId}" />
            <input type="hidden" name="StoreId" value="${this.merchantConfig.HS_StoreId}" />
            <input type="hidden" name="MerchantHash" value="${this.merchantConfig.HS_MerchantHash}" />
            <input type="hidden" name="MerchantUsername" value="${this.merchantConfig.HS_MerchantUsername}" />
            <input type="hidden" name="MerchantPassword" value="${this.merchantConfig.HS_MerchantPassword}" />
            <input type="hidden" name="TransactionTypeId" value="3" />
            <input type="hidden" name="TransactionReferenceNumber" value="${gatewayOrderId}" />
            <input type="hidden" name="TransactionAmount" value="${discountedTotal.toFixed(2)}" />
          </form>
          <script>document.getElementById("ssoForm").submit();</script>
        </body>
      </html>
    `;
  }

  async createBookingAndInitiateAlfalahPayment(bookingDto: any) {
    const {
      customerEmail,
      customerName,
      customerPhone,
      bookingDate,
      bookingTime,
      paymentMethod,
      notes,
      services, // if multiple services
      ...rest
    } = bookingDto;
    console.log(bookingDto);
    const gatewayBookingId = `BOOKING-${Date.now()}`;
    console.log(gatewayBookingId);
    const transaction = await this.bookingTransactionModel.create({
      transactionId: gatewayBookingId,
      customerEmail,
      amount: Array.isArray(services)
        ? services.reduce((sum, s) => sum + (s.finalPrice || 0), 0) // cart total
        : rest.finalPrice,
      currency: 'PKR',
      status: 'Pending',
      paymentGateway: 'Bank Alfalah',
      gatewayBookingId: gatewayBookingId,
    });

    const createdBookings = [];
    if (Array.isArray(services) && services.length > 0) {
      for (const s of services) {
        const booking = await this.bookingModel.create({
          customerName,
          customerEmail,
          customerPhone,
          bookingDate,
          bookingTime,
          paymentMethod,
          notes,
          ...s,
          transaction: transaction._id,
          gatewayBookingId,
        });

        createdBookings.push(booking);

        const message = `A new order has been placed by ${booking.customerName}. Please review and process it. Order ID: ${booking._id}`;
        await this.notificationService.create(
          booking.salonId,
          message,
          booking,
        );
        this.bookingGateway.sendBookingNotification(booking);
      }
    } else {
      //  Single service
      const booking = await this.bookingModel.create({
        customerName,
        customerEmail,
        customerPhone,
        bookingDate,
        bookingTime,
        paymentMethod,
        notes,
        ...rest,
        transaction: transaction._id,
        gatewayBookingId,
      });

      createdBookings.push(booking);

      const message = `A new order has been placed by ${booking.customerName}. Please review and process it. Order ID: ${booking._id}`;
      await this.notificationService.create(booking.salonId, message, booking);
      this.bookingGateway.sendBookingNotification(booking);
    }
    // Step 4: Prepare Bank Alfalah handshake request
    const mapString =
      `HS_ChannelId=${this.merchantConfig.HS_ChannelId}` +
      `&HS_IsRedirectionRequest=0` +
      `&HS_MerchantId=${this.merchantConfig.HS_MerchantId}` +
      `&HS_StoreId=${this.merchantConfig.HS_StoreId}` +
      `&HS_ReturnURL=${this.merchantConfig.HS_ReturnURL}` +
      `&HS_MerchantHash=${this.merchantConfig.HS_MerchantHash}` +
      `&HS_MerchantUsername=${this.merchantConfig.HS_MerchantUsername}` +
      `&HS_MerchantPassword=${this.merchantConfig.HS_MerchantPassword}` +
      `&HS_TransactionReferenceNumber=${gatewayBookingId}`;
    console.log(mapString);
    const hashRequest = this.encryptAES(mapString);

    const url = `https://${this.host}/HS/HS/HS`;
    const handshakeResponse = await firstValueFrom(
      this.http.post(
        url,
        new URLSearchParams({
          HS_ChannelId: this.merchantConfig.HS_ChannelId,
          HS_IsRedirectionRequest: '0',
          HS_MerchantId: this.merchantConfig.HS_MerchantId,
          HS_StoreId: this.merchantConfig.HS_StoreId,
          HS_ReturnURL: this.merchantConfig.HS_ReturnURL,
          HS_MerchantHash: this.merchantConfig.HS_MerchantHash,
          HS_MerchantUsername: this.merchantConfig.HS_MerchantUsername,
          HS_MerchantPassword: this.merchantConfig.HS_MerchantPassword,
          HS_TransactionReferenceNumber: gatewayBookingId,
          HS_RequestHash: hashRequest,
        }).toString(),
        {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        },
      ),
    );

    const authToken = handshakeResponse.data.AuthToken;
    if (!authToken) {
      throw new Error('Failed to retrieve AuthToken from handshake response');
    }

    const totalAmount = Array.isArray(services)
      ? services.reduce((sum, s) => sum + (s.finalPrice || 0), 0)
      : rest.finalPrice;

    // Step 5: Prepare SSO form
    const mapStringSSO =
      `AuthToken=${authToken}` +
      `&RequestHash=` +
      `&ChannelId=${this.merchantConfig.HS_ChannelId}` +
      `&Currency=PKR` +
      `&IsBIN=0` +
      `&ReturnURL=${this.merchantConfig.HS_ReturnURL}` +
      `&MerchantId=${this.merchantConfig.HS_MerchantId}` +
      `&StoreId=${this.merchantConfig.HS_StoreId}` +
      `&MerchantHash=${this.merchantConfig.HS_MerchantHash}` +
      `&MerchantUsername=${this.merchantConfig.HS_MerchantUsername}` +
      `&MerchantPassword=${this.merchantConfig.HS_MerchantPassword}` +
      `&TransactionTypeId=3` +
      `&TransactionReferenceNumber=${gatewayBookingId}` +
      `&TransactionAmount=${totalAmount.toFixed(2)}`;

    const requestHashSSO = this.encryptAES(mapStringSSO);

    return `
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Bank Alfalah Payment Redirect</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
              margin: 0;
              background-color: #f4f4f4;
            }
            .container {
              text-align: center;
            }
            .loader {
              border: 4px solid #f3f3f3;
              border-top: 4px solid #3498db;
              border-radius: 50%;
              width: 40px;
              height: 40px;
              animation: spin 1s linear infinite;
              margin: 20px auto;
            }
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h2>Initiating Payment...</h2>
            <p>Please wait while we redirect you to Bank Alfalah's payment page.</p>
            <div class="loader"></div>
          </div>
          <form id="ssoForm" action="https://${this.host}/SSO/SSO/SSO" method="post">
            <input type="hidden" name="AuthToken" value="${authToken}" />
            <input type="hidden" name="RequestHash" value="${requestHashSSO}" />
            <input type="hidden" name="ChannelId" value="${this.merchantConfig.HS_ChannelId}" />
            <input type="hidden" name="Currency" value="PKR" />
            <input type="hidden" name="IsBIN" value="0" />
            <input type="hidden" name="ReturnURL" value="${this.merchantConfig.HS_ReturnURL}" />
            <input type="hidden" name="MerchantId" value="${this.merchantConfig.HS_MerchantId}" />
            <input type="hidden" name="StoreId" value="${this.merchantConfig.HS_StoreId}" />
            <input type="hidden" name="MerchantHash" value="${this.merchantConfig.HS_MerchantHash}" />
            <input type="hidden" name="MerchantUsername" value="${this.merchantConfig.HS_MerchantUsername}" />
            <input type="hidden" name="MerchantPassword" value="${this.merchantConfig.HS_MerchantPassword}" />
            <input type="hidden" name="TransactionTypeId" value="3" />
            <input type="hidden" name="TransactionReferenceNumber" value="${gatewayBookingId}" />
            <input type="hidden" name="TransactionAmount" value="${totalAmount.toFixed(2)}" />
          </form>
          <script>document.getElementById("ssoForm").submit();</script>
        </body>
      </html>
    `;
  }

  async verifyAndFinalize(OrderId: string) {
    const order = await this.orderModel
      .findById(OrderId)
      .populate<{ transaction: TransactionDocument }>('transaction');

    if (!order || !order.transaction) {
      return { success: false, reason: 'Order or transaction not found' };
    }

    const transaction = order.transaction as TransactionDocument;

    const url = `https://${this.host}/api/rest/version/72/merchant/${this.merchantConfig.HS_MerchantId}/order/${OrderId}`;
    const auth = Buffer.from(
      `merchant.${this.merchantConfig.HS_MerchantId}:${this.config.get<string>('API_PASSWORD')}`,
    ).toString('base64');

    try {
      const { data } = await firstValueFrom(
        this.http.get(url, {
          headers: { Authorization: `Basic ${auth}` },
        }),
      );

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
        await this.transactionModel.findByIdAndUpdate(transaction._id, {
          status: 'Success',
          realTransactionId,
          transactionId: realTransactionId,
        });

        return { success: true, order, transaction };
      } else {
        await Promise.all([
          this.orderModel.findByIdAndDelete(order._id),
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

  async verifyAndFinalizeBooking(bookingId: string) {
    const booking = await this.bookingModel
      .findById(bookingId)
      .populate<{ transaction: BookingTransactionDocument }>('transaction');

    if (!booking || !booking.transaction) {
      return { success: false, reason: 'Booking or transaction not found' };
    }

    const transaction = booking.transaction as BookingTransactionDocument;

    const url = `https://${this.host}/api/rest/version/72/merchant/${this.merchantConfig.HS_MerchantId}/order/${bookingId}`;
    const auth = Buffer.from(
      `merchant.${this.merchantConfig.HS_MerchantId}:${this.config.get<string>('API_PASSWORD')}`,
    ).toString('base64');

    try {
      const { data } = await firstValueFrom(
        this.http.get(url, {
          headers: { Authorization: `Basic ${auth}` },
        }),
      );

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
        await this.transactionModel.findByIdAndUpdate(transaction._id, {
          status: 'Success',
          realTransactionId,
          transactionId: realTransactionId,
        });

        return { success: true, booking, transaction };
      } else {
        await Promise.all([
          this.bookingModel.findByIdAndDelete(booking._id),
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
