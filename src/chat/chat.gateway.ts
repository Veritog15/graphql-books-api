import { SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: { origin: '*' } })
export class ChatGateway {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('message')
  handleMessage(client: Socket, payload: string): void {
    console.log(`Mensaje recibido de ${client.id}: ${payload}`);
    this.server.emit('message', { sender: client.id, content: payload });
  }
}