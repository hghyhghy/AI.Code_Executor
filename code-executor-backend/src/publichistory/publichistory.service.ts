import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class PublichistoryService {
    constructor(private prisma: PrismaService) {}

    async getAllExecutionHistories() {
        return await this.prisma.executionHistory.findMany({
            orderBy:{
                createdAt:"desc"
            },
            select:{
                id:true,
                code:true,
                language:true,
                output:true,
                createdAt:true,
                user:{
                    select:{
                        name:true
                    }
                },
                comments:{
                    select:{
                        content:true,
                        likes:true,
                        dislikes:true,
                        createdAt:true,
                        user:{
                            select:{
                                name:true
                            }
                        }
                    },
                    orderBy:{
                        createdAt:"desc"
                    }
                }
            }
        })
    }
}
