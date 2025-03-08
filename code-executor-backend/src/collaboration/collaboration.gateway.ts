import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { PrismaService } from 'src/prisma.service';

@WebSocketGateway({ cors: true })
export class CollaborationGateway {
  @WebSocketServer()
  server: Server;

  private rooms: Record<string, { users: string[]; code: string }> = {};

  constructor(private prisma: PrismaService) {}

  @SubscribeMessage("joinRoom")
  async handleJoinRoom(
    @MessageBody() data: { roomId: string, access:"read"|"write" },
    @ConnectedSocket() client: Socket
  ) {
    const { roomId,access } = data;

    // Check if room exists in DB
    let room = await this.prisma.room.findUnique({
      where: { roomId }
    });

    if (!room) {
      room = await this.prisma.room.create({
        data: { roomId, createdBy: client.id }
      });
    }

    const userRoom = await this.prisma.userRoom.upsert({
      where: { socketId_roomId: { socketId: client.id, roomId: room.id } },
      update: {access},
      create: { socketId: client.id, roomId: room.id, access }
    });

    // If room doesn't exist, initialize it
    if (!this.rooms[roomId]) {
      this.rooms[roomId] = { users: [], code: "" };
    }

    // Add client to users list (if not already present)
    if (!this.rooms[roomId].users.includes(client.id)) {
      this.rooms[roomId].users.push(client.id);
    }

    client.join(roomId);

    // Broadcast updated user list to all clients in the room
    this.server.to(roomId).emit("userJoined", {
      clientId: client.id,
      access: userRoom.access
    });
  }

  @SubscribeMessage("codeChange")
  async handleCodeChange(
    @MessageBody() data: { roomId: string; content: string },
    @ConnectedSocket() client: Socket
  ) {
    const room = await this.prisma.room.findUnique({
      where: { roomId: data.roomId }
    });

    if (!room) {
      client.emit("error", { message: "Room not found." });
      return;
    }

    const userRoom = await this.prisma.userRoom.findUnique({
      where: { socketId_roomId: { socketId: client.id, roomId: room.id } }
    });

    if (!userRoom || userRoom.access !== "write") {
      console.log(`[CODE UPDATE DENIED] User: ${client.id} tried to update Room: ${room} but has '${userRoom?.access || "no"}' access.`);
      client.emit("error", { message: "You do not have permission to edit the code." });
      return;
    }

    this.server.to(data.roomId).emit("codeUpdate", {
      content: data.content,
      from: client.id
    });
  }

  @SubscribeMessage("updateAccess")
  async handleUpdateAccess(
    @MessageBody() data: { roomId: string; socketId: string; access: "read" | "write" },
    @ConnectedSocket() client: Socket
  ) {
    const room = await this.prisma.room.findUnique({
      where: { roomId: data.roomId }
    });

    if (!room || room.createdBy !== client.id) {
      client.emit("error", { message: "Only the room creator can update access levels." });
      return;
    }

    await this.prisma.userRoom.update({
      where: { socketId_roomId: { socketId: data.socketId, roomId: room.id } },
      data: { access: data.access }
    });

    this.server.to(data.roomId).emit("accessUpdated", {
      socketId: data.socketId,
      access: data.access
    });
  }
}
