import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { CollaborationService } from './collaboration.service';
import { PrismaService } from 'src/prisma.service';

@WebSocketGateway(4000,{ cors: true })
export class CollaborationGateway {
  @WebSocketServer()
  server: Server;

  private rooms: Record<string, { code: string }> = {}; // Removed 'users' since we don't track usernames

  constructor(
    private readonly collaborationService: CollaborationService,
    private prisma: PrismaService
  ) {}


  @SubscribeMessage('joinRoom')
  async handleJoinRoom(
    @MessageBody() data: { roomId: string },
    @ConnectedSocket() client: Socket
  ) {
    const { roomId } = data;
  
    // Ensure the room exists
    let room = await this.prisma.room.findUnique({ where: { roomId } });
  
    if (!room) {
      try {
        room = await this.prisma.room.create({ data: { roomId, createdBy: client.id } });
      } catch (error) {
        if (error.code === 'P2002') {
          room = await this.prisma.room.findUnique({ where: { roomId } });
        } else {
          throw error;
        }
      }
    }
  
    // ✅ Try inserting the user-room mapping and catch duplicates
    try {
      await this.prisma.userRoom.create({
        data: { socketId: client.id, roomId },
      });
    } catch (error) {
      if (error.code !== 'P2002') throw error; // Ignore duplicate entry errors
    }
  
    // Initialize room in memory if not present
    if (!this.rooms[roomId]) {
      this.rooms[roomId] = { code: '' };
    }
  
    client.join(roomId);
    console.log(`Socket ${client.id} joined room ${roomId}`);

    client.emit("codeUpdate",{
      content:this.rooms[roomId].code,
      from:client.id
    })
  }
  
  
  

  @SubscribeMessage('codeChange')
  handleCodeChange(
    @MessageBody() data: { roomId: string; content: string },
    @ConnectedSocket() client: Socket
  ) {
    if (this.rooms[data.roomId]) {
      this.rooms[data.roomId].code = data.content; // Store latest code
    }
     
    this.server.to(data.roomId).emit('codeUpdate',{
      content:data.content,
      from:client.id
    })

    this.server.in(data.roomId).emit('codeUpdate', {
      content: data.content,
      from: client.id,
    });
  }
}
