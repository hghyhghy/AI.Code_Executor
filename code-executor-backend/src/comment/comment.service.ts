
import { Injectable,NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class CommentService {
    constructor(private  prisma:PrismaService){}

    async  getCommentsByCode(executionId:number){
        return this.prisma.comment.findMany({

            where:{
                executionId:executionId
            },
            include:{
                user:{
                    select:{
                        name:true
                    }
                }
            },
            orderBy:{
                createdAt:"desc"
            }
        })
    }

    async addComment(userId:number,executionId:number,content:string){
        return this.prisma.comment.create({

            data:{
                userId:Number(userId),
                executionId:executionId,
                content
            }
        })
    }

    async deleteComment(commentId:number,userId:number){
        const comment  =  await this.prisma.comment.findUnique({
            where:{
                id:commentId
            }
        })
        if (!comment) throw new NotFoundException('Comment not found');
        if (comment.userId !== userId) throw new NotFoundException('Unauthorized to delete this comment');
        return this.prisma.comment.delete({
            where:{
                id:commentId
            }
        })
    }
}
