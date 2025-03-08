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

@WebSocketGateway({ cors: true })
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

    // Check if room exists in the database
    let room = await this.prisma.room.findUnique({
      where: { roomId: roomId },
    });

    // If room doesn't exist, create it with Socket ID as createdBy
    if (!room) {
      room = await this.prisma.room.create({
        data: { roomId, createdBy: client.id },
      });
    }

    // Add socket ID to UserRoom table (ensuring unique entry per socket)
    await this.prisma.userRoom.upsert({
      where: { socketId_roomId: { socketId: client.id, roomId: room.id } },
      update: {},
      create: { socketId: client.id, roomId: room.id },
    });

    // If room isn't already in memory, initialize it
    if (!this.rooms[roomId]) {
      this.rooms[roomId] = { code: '' };
    }

    client.join(roomId);
    console.log(`Socket ${client.id} joined room ${roomId}`);
  }

  @SubscribeMessage('codeChange')
  handleCodeChange(
    @MessageBody() data: { roomId: string; content: string },
    @ConnectedSocket() client: Socket
  ) {
    if (this.rooms[data.roomId]) {
      this.rooms[data.roomId].code = data.content; // Store latest code
    }

    this.server.to(data.roomId).emit('codeUpdate', {
      content: data.content,
      from: client.id,
    });
  }
}
