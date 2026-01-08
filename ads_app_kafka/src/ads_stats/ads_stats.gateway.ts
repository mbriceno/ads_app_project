import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({ cors: true })
export class AdsStatsGateway {
  @WebSocketServer() server: Server;

  sendStatsUpdate(data: any) {
    this.server.emit('stats-update', data);
  }
}