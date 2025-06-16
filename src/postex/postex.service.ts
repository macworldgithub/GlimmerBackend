// src/order/postex.service.ts
import { Get, Injectable, NotFoundException, Query } from '@nestjs/common';
import axios from 'axios';
import { PostexOrderDto } from './dto/req/postex.order.dto';
import { Order, OrderDocument } from 'src/schemas/ecommerce/order.schema';
import {
  RegisteredPostexOrderDocument,
  RegisteredPostexOrder,
} from 'src/schemas/ecommerce/registered_postex_order';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ApiQuery } from '@nestjs/swagger';
import { ListOrdersQueryDto } from './dto/req/list_order_query_dto';

@Injectable()
export class PostexService {
  private readonly apiUrl =
    'https://api.postex.pk/services/integration/api/order/v3/create-order';
  private readonly token = process.env.POSTEX_TOKEN;

  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(RegisteredPostexOrder.name)
    private registeredModel: Model<RegisteredPostexOrderDocument>,
  ) {}

  async createPostexOrder(orderId: PostexOrderDto) {
    const order = await this.orderModel.findById(orderId).exec();

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const body = {
      cityName: order.ShippingInfo.city,
      customerName: order.customerName,
      customerPhone: order.ShippingInfo.phone,
      deliveryAddress: order.ShippingInfo.address,
      invoiceDivision: 1, // Assuming 1 package
      invoicePayment: order.discountedTotal,
      items: order.productList.length,
      orderDetail: order.productList
        .map((p) => `${p.product.name} x ${p.quantity}`)
        .join(', '),
      //@ts-ignore
      orderRefNumber: order._id.toString(),
      orderType: 'Normal',
      transactionNotes: 'Generated from backend',
    };

    try {
      const headers = {
        token: this.token,
        'Content-Type': 'application/json',
      };

      const response = await axios.post(this.apiUrl, body, { headers });
      const trackingData = response.data?.dist;

      await this.registeredModel.create({
        //@ts-ignore
        orderId: order._id.toString(),
        trackingNumber: trackingData.trackingNumber,
        orderDate: trackingData.orderDate,
        deliver_to_postex: false, // Initially not yet delivered
      });

      await this.orderModel.findByIdAndUpdate(order._id, {
        status: 'Confirmed',
      });

      return response.data;
    } catch (error: any) {
      throw new Error(
        `Failed to create PostEx order: ${error.response?.data?.statusMessage || error.message}`,
      );
    }
  }

  async updateDeliveryStatus(id: string, status: boolean) {
    const updated = await this.registeredModel.findByIdAndUpdate(
      id,
      { deliver_to_postex: status },
      { new: true },
    );

    if (!updated) {
      throw new NotFoundException('PostEx registration record not found');
    }

    return {
      message: 'Delivery status updated',
      data: updated,
    };
  }

  async getOperationalCities(filter?: { operationalCityType?: string }) {
    try {
      const response = await axios.get(
        'https://api.postex.pk/services/integration/api/order/v2/get-operational-city',
        {
          headers: {
            token: this.token,
          },
          params: filter,
        },
      );

      return response.data;
    } catch (error: any) {
      throw new Error(
        `Failed to fetch operational cities: ${error.response?.data?.statusMessage || error.message}`,
      );
    }
  }

  async listOrders(query: {
    orderStatusID: number;
    fromDate: string;
    toDate: string;
  }) {
    try {
      const response = await axios.get(
        'https://api.postex.pk/services/integration/api/order/v1/get-all-order',
        {
          headers: {
            token: this.token,
          },
          params: query,
        },
      );

      return response.data;
    } catch (error: any) {
      throw new Error(
        `Failed to list PostEx orders: ${error.response?.data?.statusMessage || error.message}`,
      );
    }
  }

  async trackOrder(trackingNumber: string) {
    try {
      const url = `https://api.postex.pk/services/integration/api/order/v1/track-order/${trackingNumber}`;
      const response = await axios.get(url, {
        headers: {
          token: this.token,
        },
      });

      const statusMap: Record<string, string> = {
        '0001': 'At Merchant’s Warehouse',
        '0002': 'Returned',
        '0003': 'At PostEx Warehouse',
        '0004': 'Package on Route',
        '0005': 'Delivered',
        '0006': 'Returned',
        '0007': 'Returned',
        '0008': 'Delivery Under Review',
        '0013': 'Attempt Made: Reason Here',
      };

      const data = response.data;

      if (data?.dist?.transactionStatusHistory) {
        data.dist.transactionStatusHistory =
          data.dist.transactionStatusHistory.map((item: any) => ({
            ...item,
            statusMeaning:
              statusMap[item.transactionStatusMessageCode] || 'Unknown Status',
          }));
      }

      return data;
    } catch (error: any) {
      throw new Error(
        `Failed to track order: ${error.response?.data?.statusMessage || error.message}`,
      );
    }
  }

  async cancelOrder(trackingNumber: string) {
    try {
      const response = await axios.put(
        'https://api.postex.pk/services/integration/api/order/v1/cancel-order',
        { trackingNumber },
        {
          headers: {
            token: this.token,
          },
        },
      );

      if (
        response.data?.statusCode === '200' ||
        response.data?.statusCode === 200
      ) {
        // Update RegisteredPostexOrder
        const registeredOrder = await this.registeredModel.findOneAndUpdate(
          { trackingNumber },
          { orderStatus: 'cancelled' },
          { new: true },
        );

        if (registeredOrder) {
          // Update corresponding Order as well
          await this.orderModel.findByIdAndUpdate(registeredOrder.orderId, {
            status: 'Cancelled',
          });
        }

        return {
          message:
            'Order successfully cancelled in PostEx , Registered Postex and Orders',
          trackingNumber,
        };
      }

      throw new Error('PostEx did not return success status');
    } catch (error: any) {
      throw new Error(
        `Failed to cancel order: ${error.response?.data?.statusMessage || error.message}`,
      );
    }
  }

  // src/order/postex.service.ts
  async getPaymentStatus(trackingNumber: string) {
    try {
      const url = `https://api.postex.pk/services/integration/api/order/v1/payment-status/${trackingNumber}`;
      const response = await axios.get(url, {
        headers: {
          token: this.token,
        },
      });

      return response.data;
    } catch (error: any) {
      throw new Error(
        `Failed to retrieve payment status: ${error.response?.data?.statusMessage || error.message}`,
      );
    }
  }
}
