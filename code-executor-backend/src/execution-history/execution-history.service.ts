
import { PrismaService } from 'src/prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ExecutionHistoryService {

    constructor(private prisma:PrismaService){}

    async  getExecutionHistory(userId:number){
        return await this.prisma.executionHistory.findMany({

            where:{
                userId:Number(userId)
            },

            orderBy:{
                createdAt:'desc'
            }
        })
    }
}
