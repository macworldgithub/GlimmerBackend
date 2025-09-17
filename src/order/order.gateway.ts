import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*', // Configure this as per security needs
  },
})
export class OrderGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  handleConnection(client: any) {
    const storeId = this.getStoreIdFromTokenOrQuery(client); // implement this method
    if (storeId) {
      client.join(storeId.toString()); // Join room with storeId
      console.log(`Store ${storeId} joined room`);
    }
  }

  handleDisconnect(client: any) {
    console.log(`Client disconnected: ${client.id}`);
  }

  sendOrderNotification(order: any) {
    const storeId = order.productList?.[0]?.storeId;
    if (!storeId) {
      console.warn('No storeId found in order.productList');
      return;
    }
    const plainOrder = order.toObject ? order.toObject() : order;

    this.server.to(storeId.toString()).emit('newOrder', {
      ...plainOrder,
      storeId,
    });
  }
  private getStoreIdFromTokenOrQuery(client: Socket): string | null {
    const { storeId } = client.handshake.query;

    if (storeId && typeof storeId === 'string') {
      return storeId;
    }

    return null;
  }
}
