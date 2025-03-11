
import { PrismaService } from 'src/prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ExecutionHistoryService {

    constructor(private prisma:PrismaService){}

    async  getExecutionHistory(userId:number){
        return  await this.prisma.executionHistory.findMany({

            where:{
                userId:Number(userId)
            },

            orderBy:{
                createdAt:'desc'
            },
            include:{
                user:{
                    select:{
                        name:true
                    }
                }
            }
        })

    }
    
  // Delete ALL Execution History for a user
    async  deleteExecutionHistory(userId:number){
        return await this.prisma.executionHistory.deleteMany({
            where:{
                userId:Number(userId)
            }
        })
    }

    // Delete a SPECIFIC Execution History entry
    async deleteSpecificHistiory(entryId:number,userId:number){
        return  await this.prisma.executionHistory.delete({
            where:{
                id:entryId,
                userId:Number(userId)
            }
        })
    }
}
