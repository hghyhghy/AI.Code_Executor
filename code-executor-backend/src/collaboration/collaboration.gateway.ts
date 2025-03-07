import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  ConnectedSocket
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { CollaborationService } from './collaboration.service';

@WebSocketGateway({cors:true})
export class CollaborationGateway {

  @WebSocketServer()
  server:Server

  constructor(private readonly collaborationService:CollaborationService){}
  @SubscribeMessage('joinRoom')
  handleJoinRoom(
      
  @MessageBody() data:{roomId:string},
  @ConnectedSocket() client:Socket
  ) {

    client.join(data.roomId)
    this.server.to(data.roomId).emit('userJoined', {clientId:client.id})
  }

  @SubscribeMessage('codeChange')
  handleCodeChange(
    
    @MessageBody() data:{roomId:string, content:string},
    @ConnectedSocket() client:Socket
  ){
    this.server.to(data.roomId).emit('codeUpdate',{
      content:data.content,
      from:client.id
    })
  }
}
