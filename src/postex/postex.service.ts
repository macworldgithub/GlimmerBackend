// // src/order/postex.service.ts
// import { Get, Injectable, NotFoundException, Query } from '@nestjs/common';
// import axios from 'axios';
// import { PostexOrderDto } from './dto/req/postex.order.dto';
// import { Order, OrderDocument } from 'src/schemas/ecommerce/order.schema';
// import {
//   RegisteredPostexOrderDocument,
//   RegisteredPostexOrder,
// } from 'src/schemas/ecommerce/registered_postex_order';
// import { InjectModel } from '@nestjs/mongoose';
// import { Model } from 'mongoose';
// import { ApiQuery } from '@nestjs/swagger';
// import { ListOrdersQueryDto } from './dto/req/list_order_query_dto';

// @Injectable()
// export class PostexService {
//   private readonly apiUrl =
//     'https://api.postex.pk/services/integration/api/order/v3/create-order';
//   private readonly token = process.env.POSTEX_TOKEN;

//   constructor(
//     @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
//     @InjectModel(RegisteredPostexOrder.name)
//     private registeredModel: Model<RegisteredPostexOrderDocument>,
//   ) {}

//   async createPostexOrder(orderId: PostexOrderDto) {
//     const order = await this.orderModel.findById(orderId).exec();

//     if (!order) {
//       throw new NotFoundException('Order not found');
//     }

//     const body = {
//       cityName: order.ShippingInfo.city,
//       customerName: order.customerName,
//       customerPhone: order.ShippingInfo.phone,
//       deliveryAddress: order.ShippingInfo.address,
//       invoiceDivision: 1, // Assuming 1 package
//       invoicePayment: order.discountedTotal,
//       items: order.productList.length,
//       orderDetail: order.productList
//         .map((p) => `${p.product.name} x ${p.quantity}`)
//         .join(', '),
//       //@ts-ignore
//       orderRefNumber: order._id.toString(),
//       orderType: 'Normal',
//       transactionNotes: 'Generated from backend',
//     };

//     try {
//       const headers = {
//         token: this.token,
//         'Content-Type': 'application/json',
//       };

//       const response = await axios.post(this.apiUrl, body, { headers });
//       const trackingData = response.data?.dist;

//       await this.registeredModel.create({
//         //@ts-ignore
//         orderId: order._id.toString(),
//         trackingNumber: trackingData.trackingNumber,
//         orderDate: trackingData.orderDate,
//         deliver_to_postex: false, // Initially not yet delivered
//       });

//       await this.orderModel.findByIdAndUpdate(order._id, {
//         status: 'Confirmed',
//       });

//       return response.data;
//     } catch (error: any) {
//       throw new Error(
//         `Failed to create PostEx order: ${error.response?.data?.statusMessage || error.message}`,
//       );
//     }
//   }

//   async updateDeliveryStatus(id: string, status: boolean) {
//     const updated = await this.registeredModel.findByIdAndUpdate(
//       id,
//       { deliver_to_postex: status },
//       { new: true },
//     );

//     if (!updated) {
//       throw new NotFoundException('PostEx registration record not found');
//     }

//     return {
//       message: 'Delivery status updated',
//       data: updated,
//     };
//   }

//   async getOperationalCities(filter?: { operationalCityType?: string }) {
//     try {
//       const response = await axios.get(
//         'https://api.postex.pk/services/integration/api/order/v2/get-operational-city',
//         {
//           headers: {
//             token: this.token,
//           },
//           params: filter,
//         },
//       );

//       return response.data;
//     } catch (error: any) {
//       throw new Error(
//         `Failed to fetch operational cities: ${error.response?.data?.statusMessage || error.message}`,
//       );
//     }
//   }

//   async listOrders(query: {
//     orderStatusID: number;
//     fromDate: string;
//     toDate: string;
//   }) {
//     try {
//       const response = await axios.get(
//         'https://api.postex.pk/services/integration/api/order/v1/get-all-order',
//         {
//           headers: {
//             token: this.token,
//           },
//           params: query,
//         },
//       );

//       return response.data;
//     } catch (error: any) {
//       throw new Error(
//         `Failed to list PostEx orders: ${error.response?.data?.statusMessage || error.message}`,
//       );
//     }
//   }

//   async trackOrder(trackingNumber: string) {
//     try {
//       const url = `https://api.postex.pk/services/integration/api/order/v1/track-order/${trackingNumber}`;
//       const response = await axios.get(url, {
//         headers: {
//           token: this.token,
//         },
//       });

//       const statusMap: Record<string, string> = {
//         '0001': 'At Merchant’s Warehouse',
//         '0002': 'Returned',
//         '0003': 'At PostEx Warehouse',
//         '0004': 'Package on Route',
//         '0005': 'Delivered',
//         '0006': 'Returned',
//         '0007': 'Returned',
//         '0008': 'Delivery Under Review',
//         '0013': 'Attempt Made: Reason Here',
//       };

//       const data = response.data;

//       if (data?.dist?.transactionStatusHistory) {
//         data.dist.transactionStatusHistory =
//           data.dist.transactionStatusHistory.map((item: any) => ({
//             ...item,
//             statusMeaning:
//               statusMap[item.transactionStatusMessageCode] || 'Unknown Status',
//           }));
//       }

//       return data;
//     } catch (error: any) {
//       throw new Error(
//         `Failed to track order: ${error.response?.data?.statusMessage || error.message}`,
//       );
//     }
//   }

//   async cancelOrder(trackingNumber: string) {
//     try {
//       const response = await axios.put(
//         'https://api.postex.pk/services/integration/api/order/v1/cancel-order',
//         { trackingNumber },
//         {
//           headers: {
//             token: this.token,
//           },
//         },
//       );

//       if (
//         response.data?.statusCode === '200' ||
//         response.data?.statusCode === 200
//       ) {
//         // Update RegisteredPostexOrder
//         const registeredOrder = await this.registeredModel.findOneAndUpdate(
//           { trackingNumber },
//           { orderStatus: 'cancelled' },
//           { new: true },
//         );

//         if (registeredOrder) {
//           // Update corresponding Order as well
//           await this.orderModel.findByIdAndUpdate(registeredOrder.orderId, {
//             status: 'Cancelled',
//           });
//         }

//         return {
//           message:
//             'Order successfully cancelled in PostEx , Registered Postex and Orders',
//           trackingNumber,
//         };
//       }

//       throw new Error('PostEx did not return success status');
//     } catch (error: any) {
//       throw new Error(
//         `Failed to cancel order: ${error.response?.data?.statusMessage || error.message}`,
//       );
//     }
//   }

//   // src/order/postex.service.ts
//   async getPaymentStatus(trackingNumber: string) {
//     try {
//       const url = `https://api.postex.pk/services/integration/api/order/v1/payment-status/${trackingNumber}`;
//       const response = await axios.get(url, {
//         headers: {
//           token: this.token,
//         },
//       });

//       return response.data;
//     } catch (error: any) {
//       throw new Error(
//         `Failed to retrieve payment status: ${error.response?.data?.statusMessage || error.message}`,
//       );
//     }
//   }
// }


// src/order/postex.service.ts
// import { Get, Injectable, NotFoundException, Query } from '@nestjs/common';
// import axios from 'axios';
// import { PostexOrderDto } from './dto/req/postex.order.dto';
// import { Order, OrderDocument } from 'src/schemas/ecommerce/order.schema';
// import {
//   RegisteredPostexOrderDocument,
//   RegisteredPostexOrder,
// } from 'src/schemas/ecommerce/registered_postex_order';
// import { InjectModel } from '@nestjs/mongoose';
// import { Model } from 'mongoose';
// import { ApiQuery } from '@nestjs/swagger';
// import { ListOrdersQueryDto } from './dto/req/list_order_query_dto';

// @Injectable()
// export class PostexService {
//   private readonly apiUrl = 'https://api.postex.pk/services/integration/api/order/v3/create-order';
//   private readonly token = process.env.POSTEX_TOKEN;
//   private readonly addressApiUrl = 'https://api.postex.pk/services/integration/api/order/v1/get-merchant-address';
//   private readonly createAddressApiUrl = 'https://api.postex.pk/services/integration/api/order/v2/create-merchant-address';

//   constructor(
//     @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
//     @InjectModel(RegisteredPostexOrder.name)
//     private registeredModel: Model<RegisteredPostexOrderDocument>,
//   ) {}

 
//   async getMerchantAddress(cityName?: string): Promise<string | null> {
//     try {
//       const headers = { token: this.token, 'Content-Type': 'application/json' };
//       const response = await axios.get(this.addressApiUrl, {
//         headers,
//         params: cityName ? { cityName } : {},
//       });

//       console.log('Get Merchant Address Response:', JSON.stringify(response.data, null, 2));

//       if (response.data.statusCode === '200' && response.data.dist?.length > 0) {
//         const address = response.data.dist.find((a: any) => !cityName || a.cityName === cityName);
//         return address ? address.addressCode : null;
//       }
//       return null;
//     } catch (error: any) {
//       console.error('Error fetching merchant address:', JSON.stringify(error.response?.data, null, 2) || error.message);
//       return null;
//     }
//   }

//   async createMerchantAddress(order: OrderDocument): Promise<string> {
//     try {
//       const headers = { token: this.token, 'Content-Type': 'application/json' };
//       const body = {
//         address: 'North Karachi 11-C/1',
//         addressTypeId: 2, // 2 for Pickup
//         cityName: order.ShippingInfo.city,
//         contactPersonName: 'Warehouse Manager',
//         phone1: order.ShippingInfo.phone.replace(/[^0-9]/g, ''), // Ensure numeric only
//         phone2: order.ShippingInfo.phone.replace(/[^0-9]/g, ''), // Ensure numeric only
//         phone3: '', // Optional
//         wareHouseManagerName: 'Warehouse Manager', // Optional
//       };

//       console.log('Create Merchant Address Request Body:', JSON.stringify(body, null, 2));

//       const response = await axios.post(this.createAddressApiUrl, body, { headers });

//       console.log('Create Merchant Address Response:', JSON.stringify(response.data, null, 2));

//       if (response.data.statusCode === '200') {
//         // Adjust based on actual response structure
//         // const addressCode = response.data.dist?.addressCode || response.data.addressCode;
//         const addressCode = 'ONF7E5';
//         if (addressCode) return addressCode;
//         throw new Error('No addressCode found in response');
//       }
//       throw new Error(`Unexpected status code: ${response.data.statusCode}`);
//     } catch (error: any) {
//       console.error('Error creating merchant address:', JSON.stringify(error.response?.data, null, 2) || error.message);
//       throw new Error(`Failed to create merchant address: ${error.response?.data?.statusMessage || error.message}`);
//     }
//   }

//   async createPostexOrder(orderIdDto: PostexOrderDto) {
//     const order = await this.orderModel.findById(orderIdDto.orderId).exec();

//     if (!order) {
//       throw new NotFoundException('Order not found');
//     }

//     // Fetch existing address code for the order's city
//     // let addressCode = await this.getMerchantAddress(order.ShippingInfo.city);
//     let addressCode = '002'
//     if (!addressCode) {
//       // Create a new address if none found, with retry logic
//       try {
//         // addressCode = await this.createMerchantAddress(order);
//         addressCode = 'ONF7E5';
//       } catch (error) {
//         console.error('Retry attempt for creating address failed:', error);
//         throw new Error('Failed to create a valid address code after retry');
//       }
//     }

//     // Validate addressCode before proceeding
//     if (!addressCode) {
//       throw new Error('Failed to obtain a valid address code for PostEx order creation');
//     }

//     const body = {
//       cityName: order.ShippingInfo.city,
//       customerName: order.customerName,
//       customerPhone: order.ShippingInfo.phone,
//       deliveryAddress: order.ShippingInfo.address,
//       invoiceDivision: 1,
//       invoicePayment: order.discountedTotal,
//       items: order.productList.length,
//       orderDetail: order.productList
//         .map((p) => `${p.product.name} x ${p.quantity}`)
//         .join(', '),
//       orderRefNumber: order._id?.toString() || '',
//       orderType: 'Normal',
//       transactionNotes: 'Generated from backend',
//       pickupAddressCode: addressCode,
//       // storeAddressCode: addressCode,
//     };

//     try {
//       const headers = {
//         token: this.token,
//         'Content-Type': 'application/json',
//       };

//       console.log('PostEx Order Creation Request Body:', JSON.stringify(body, null, 2));

//       const response = await axios.post(this.apiUrl, body, { headers });
//       const trackingData = response.data?.dist;

//       await this.registeredModel.create({
//         orderId: order._id?.toString() || '',
//         trackingNumber: trackingData.trackingNumber,
//         orderDate: trackingData.orderDate,
//         deliver_to_postex: false,
//       });

//       await this.orderModel.findByIdAndUpdate(order._id, {
//         status: 'Confirmed',
//       });

//       return response.data;
//     } catch (error: any) {
//       console.error('PostEx Order Creation Error:', JSON.stringify(error.response?.data, null, 2) || error.message);
//       throw new Error(
//         `Failed to create PostEx order: ${error.response?.data?.statusMessage || error.message}`,
//       );
//     }
//   }

//   async updateDeliveryStatus(id: string, status: boolean) {
//     const updated = await this.registeredModel.findByIdAndUpdate(
//       id,
//       { deliver_to_postex: status },
//       { new: true },
//     );

//     if (!updated) {
//       throw new NotFoundException('PostEx registration record not found');
//     }

//     return {
//       message: 'Delivery status updated',
//       data: updated,
//     };
//   }

//   async getOperationalCities(filter?: { operationalCityType?: string }) {
//     try {
//       const response = await axios.get(
//         'https://api.postex.pk/services/integration/api/order/v2/get-operational-city',
//         {
//           headers: {
//             token: this.token,
//           },
//           params: filter,
//         },
//       );

//       return response.data;
//     } catch (error: any) {
//       throw new Error(
//         `Failed to fetch operational cities: ${error.response?.data?.statusMessage || error.message}`,
//       );
//     }
//   }

//   async listOrders(query: {
//     orderStatusID: number;
//     fromDate: string;
//     toDate: string;
//   }) {
//     try {
//       const response = await axios.get(
//         'https://api.postex.pk/services/integration/api/order/v1/get-all-order',
//         {
//           headers: {
//             token: this.token,
//           },
//           params: query,
//         },
//       );

//       return response.data;
//     } catch (error: any) {
//       throw new Error(
//         `Failed to list PostEx orders: ${error.response?.data?.statusMessage || error.message}`,
//       );
//     }
//   }

//   async trackOrder(trackingNumber: string) {
//     try {
//       const url = `https://api.postex.pk/services/integration/api/order/v1/track-order/${trackingNumber}`;
//       const response = await axios.get(url, {
//         headers: {
//           token: this.token,
//         },
//       });

//       const statusMap: Record<string, string> = {
//         '0001': 'At Merchant’s Warehouse',
//         '0002': 'Returned',
//         '0003': 'At PostEx Warehouse',
//         '0004': 'Package on Route',
//         '0005': 'Delivered',
//         '0006': 'Returned',
//         '0007': 'Returned',
//         '0008': 'Delivery Under Review',
//         '0013': 'Attempt Made: Reason Here',
//       };

//       const data = response.data;

//       if (data?.dist?.transactionStatusHistory) {
//         data.dist.transactionStatusHistory =
//           data.dist.transactionStatusHistory.map((item: any) => ({
//             ...item,
//             statusMeaning:
//               statusMap[item.transactionStatusMessageCode] || 'Unknown Status',
//           }));
//       }

//       return data;
//     } catch (error: any) {
//       throw new Error(
//         `Failed to track order: ${error.response?.data?.statusMessage || error.message}`,
//       );
//     }
//   }

//   async cancelOrder(trackingNumber: string) {
//     try {
//       const response = await axios.put(
//         'https://api.postex.pk/services/integration/api/order/v1/cancel-order',
//         { trackingNumber:"28393810000002" },
//         {
//           headers: {
//             token: this.token,
//           },
//         },
//       );

//       if (
//         response.data?.statusCode === '200' ||
//         response.data?.statusCode === 200
//       ) {
//         // Update RegisteredPostexOrder
//         const registeredOrder = await this.registeredModel.findOneAndUpdate(
//           { trackingNumber },
//           { orderStatus: 'cancelled' },
//           { new: true },
//         );

//         if (registeredOrder) {
//           // Update corresponding Order as well
//           await this.orderModel.findByIdAndUpdate(registeredOrder.orderId, {
//             status: 'Cancelled',
//           });
//         }

//         return {
//           message:
//             'Order successfully cancelled in PostEx , Registered Postex and Orders',
//           trackingNumber,
//         };
//       }

//       throw new Error('PostEx did not return success status');
//     } catch (error: any) {
//       throw new Error(
//         `Failed to cancel order: ${error.response?.data?.statusMessage || error.message}`,
//       );
//     }
//   }

//   // src/order/postex.service.ts
//   async getPaymentStatus(trackingNumber: string) {
//     try {
//       const url = `https://api.postex.pk/services/integration/api/order/v1/payment-status/${trackingNumber}`;
//       const response = await axios.get(url, {
//         headers: {
//           token: this.token,
//         },
//       });

//       return response.data;
//     } catch (error: any) {
//       throw new Error(
//         `Failed to retrieve payment status: ${error.response?.data?.statusMessage || error.message}`,
//       );
//     }
//   }
// }
import { Injectable, NotFoundException } from '@nestjs/common';
import axios from 'axios';
import { PostexOrderDto } from './dto/req/postex.order.dto';
import { OrderDocument, Order } from 'src/schemas/ecommerce/order.schema';
import {
  RegisteredPostexOrderDocument,
  RegisteredPostexOrder,
} from 'src/schemas/ecommerce/registered_postex_order';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Store, StoreDocument } from 'src/schemas/ecommerce/store.schema';

@Injectable()
export class PostexService {
  private readonly apiUrl = 'https://api.postex.pk/services/integration/api/order/v3/create-order';
  private readonly addressApiUrl = 'https://api.postex.pk/services/integration/api/order/v1/get-merchant-address';
  private readonly createAddressApiUrl = 'https://api.postex.pk/services/integration/api/order/v2/create-merchant-address';
  private readonly token = process.env.POSTEX_TOKEN;

  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(RegisteredPostexOrder.name)
    private registeredModel: Model<RegisteredPostexOrderDocument>,
    @InjectModel(Store.name) private storeModel: Model<StoreDocument>,
  ) {}

  async getMerchantAddress(cityName?: string, storeAddress?: string): Promise<string | null> {
    try {
      console.log("I am in get merchant")
      const headers = { token: this.token, 'Content-Type': 'application/json' };
      const response = await axios.get(this.addressApiUrl, {
        headers,
        params: cityName ? { cityName } : {},
      });

      console.log('Get Merchant Address Responseee:', JSON.stringify(response.data, null, 2));

      if (Number(response.data.statusCode) === 200 && response.data.dist?.length > 0) {
        const address = response.data.dist.find((a: any) => 
          storeAddress && a.address && a.address.toLowerCase() === storeAddress.toLowerCase()
        );
        return address ? address.addressCode : null;
      }
      return null;
    } catch (error: any) {
      console.error('Error fetching merchant address:', JSON.stringify(error.response?.data, null, 2) || error.message);
      return null;
    }
  }

  async createMerchantAddress(store: StoreDocument): Promise<string> {
    try {
      const headers = { token: this.token, 'Content-Type': 'application/json' };
      console.log(store.address)
      const body = {
        address: store.address || 'Default Warehouse Address',
        addressTypeId: 2, // 2 for Pickup
        cityName: store.cityName ,
        contactPersonName: store.vendor_name || 'Warehouse Manager',
        phone1:  '03032024363',
        phone2: '03032024363',
        wareHouseManagerName: store.vendor_name || 'Warehouse Manager',
      };

      console.log('Create Merchant Address Request Body:', JSON.stringify(body, null, 2));

      const response = await axios.post(this.createAddressApiUrl, body, { headers });

      console.log('Create Merchant Address Response:', JSON.stringify(response.data, null, 2));

      if (Number(response.data.statusCode) === 200 && response.data.dist?.pickupAddressCode) {
        const addressCode = response.data.dist.pickupAddressCode;
        if (addressCode) return addressCode;
        throw new Error('No pickupAddressCode found in response');
      }
      throw new Error(`Unexpected status code: ${response.data.statusCode}`);
    } catch (error: any) {
      console.error('Error creating merchant address:', JSON.stringify(error.response?.data, null, 2) || error.message);
      throw new Error(`Failed to create merchant address: ${error.response?.data?.statusMessage || error.message}`);
    }
  }

  async createPostexOrder(orderIdDto: PostexOrderDto) {
    const order = await this.orderModel.findById(orderIdDto.orderId).exec();

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Group products by storeId
    const storeGroups = order.productList.reduce((groups, item) => {
      const storeId = item.storeId;
      if (!groups[storeId]) groups[storeId] = [];
      groups[storeId].push(item);
      return groups;
    }, {} as { [key: string]: typeof order.productList });
    console.log(storeGroups)
    const results = [];
    for (const storeId in storeGroups) {
      const products = storeGroups[storeId];
      const store = await this.storeModel.findById(storeId).exec();
      let addressCode = null;

      if (store) {
        // Use store's cityName and address to fetch existing address code
        addressCode = await this.getMerchantAddress(store.cityName , store.address );
        console.log(addressCode)
      }

      if (!addressCode && store) {
        // Create a new address if none exists for the store
        addressCode = await this.createMerchantAddress(store);
      }

      // If still no addressCode, use order's city and address as a fallback
      // if (!addressCode) {
      //   addressCode = await this.getMerchantAddress(order.ShippingInfo.city, order.ShippingInfo.address);
      //   if (!addressCode) {
      //     addressCode = await this.createMerchantAddress({
      //       address: order.ShippingInfo.address,
      //       cityName: order.ShippingInfo.city,
      //     } as any); // Type assertion as minimal StoreDocument
      //   }
      // }

      // Validate addressCode before proceeding
      if (!addressCode) {
        throw new Error('Failed to obtain a valid address code for PostEx order creation');
      }

      const body = {
        cityName: order.ShippingInfo.city,
        customerName: order.customerName,
        customerPhone: order.ShippingInfo.phone,
        deliveryAddress: order.ShippingInfo.address,
        invoiceDivision: products.length,
        invoicePayment: products.reduce((sum, p) => sum + p.total_price, 0),
        items: products.length,
        orderDetail: products
          .map((p) => `${p.product.name} x ${p.quantity}`)
          .join(', '),
        orderRefNumber: order._id?.toString() || '',
        orderType: 'Normal',
        transactionNotes: `Generated from backend, pick from ${store ? store.store_name : 'Unknown Store'}`,
        pickupAddressCode: addressCode,
      };

      try {
        const headers = {
          token: this.token,
          'Content-Type': 'application/json',
        };

        console.log(`PostEx Order Creation Request Body for Store ${storeId}:`, JSON.stringify(body, null, 2));

        const response = await axios.post(this.apiUrl, body, { headers });
        const trackingData = response.data?.dist;
        console.log(trackingData)
        console.log(trackingData.trackingNumber)
        await this.orderModel.findByIdAndUpdate(order._id, {
          $push: { trackingNumbers: trackingData.trackingNumber },
          status: 'Confirmed',
        }, { new: true });

        await this.registeredModel.create({
          orderId: order._id?.toString() || '',
          trackingNumber: trackingData.trackingNumber,
          orderDate: trackingData.orderDate,
          deliver_to_postex: false,
        });

        results.push(response.data);
      } catch (error: any) {
        console.error(`PostEx Order Creation Error for Store ${storeId}:`, JSON.stringify(error.response?.data, null, 2) || error.message);
        throw new Error(
          `Failed to create PostEx order for store ${storeId}: ${error.response?.data?.statusMessage || error.message}`,
        );
      }
    }

    return results.length > 0 ? results : { message: 'No orders created due to errors' };
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
        Number(response.data.statusCode) === 200 ||
        response.data.statusCode === '200'
      ) {
        const registeredOrder = await this.registeredModel.findOneAndUpdate(
          { trackingNumber },
          { orderStatus: 'cancelled' },
          { new: true },
        );

        if (registeredOrder) {
          await this.orderModel.findByIdAndUpdate(registeredOrder.orderId, {
            status: 'Cancelled',
          });
        }

        return {
          message:
            'Order successfully cancelled in PostEx, Registered Postex, and Orders',
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