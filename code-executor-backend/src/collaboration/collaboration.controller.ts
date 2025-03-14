
import { Controller, Post, Body, Get, Query ,Req} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Request } from 'express';

@Controller('rooms')
export class RoomController {
    constructor (private prisma:PrismaService){}


    @Post('create')
    async createRoom(@Req() req:Request ){
        
        const userId =  (req.user as any) ?.id
        const roomId =  Math.random().toString(36).substring(2, 6);
        await this.prisma.room.create({
            // Ensure exactly 4 characters
            data:{
                roomId,
                createdBy:userId
            }
        });

        return { roomId }
    }

    @Get('validate')
    async validateRoom(@Query('roomId') roomId:string){
            const room =  await this.prisma.room.findUnique({
                where:{
                    roomId:roomId
                }
            })

            return {
                valid: !! room
            }
    }

}