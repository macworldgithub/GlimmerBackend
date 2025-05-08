import {
    WebSocketGateway,
    WebSocketServer,
    OnGatewayConnection,
    OnGatewayDisconnect,
  } from '@nestjs/websockets';
  import { Server } from 'socket.io';
  
  @WebSocketGateway({
    cors: {
      origin: '*', // Configure this as per security needs
    },
  })
  export class BookingGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server!: Server;
  
    handleConnection(client: any) {
      console.log(`Client connected: ${client.id}`);
    }
  
    handleDisconnect(client: any) {
      console.log(`Client disconnected: ${client.id}`);
    }
  
    sendBookingNotification(booking: any) {
      this.server.emit('newBooking', booking); // emit to all connected clients
    }
  }
  