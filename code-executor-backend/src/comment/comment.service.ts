
import { Injectable,NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class CommentService {
    constructor(private  prisma:PrismaService){}

    async  getCommentsByCode(executionId:number){

        return this.prisma.comment.findMany({
            where: { executionId, parentId: null }, // Ensure only top-level comments are fetched
            include: {
                user: { select: { name: true } },
                replies: {
                    include: {
                        user: { select: { name: true } },
                        replies: {  // Fetch nested replies
                            include: {
                                user: { select: { name: true } }
                            }
                        }
                    },
                    orderBy: { createdAt: 'asc' }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    async addComment(userId:number,executionId:number,content:string){
        return this.prisma.comment.create({

            data:{
                userId:Number(userId),
                executionId:executionId,
                content,
            }
        })
    }

    async addreply(userId:number,executionId:number,content:string,parentId?:number){
        return this.prisma.comment.create({
            data:{
                userId:Number(userId),
                executionId:executionId,
                content,
                parentId:parentId??null
            }
        })
    }

    async deleteComment(commentId:number,userId:number){
        const comment  =  await this.prisma.comment.findUnique({
            where:{
                id:commentId
            }, include:{
                replies:true
            }
        })
        if (!comment) throw new NotFoundException('Comment not found');
        if (comment.userId !== userId) throw new NotFoundException('Unauthorized to delete this comment');
        await this.prisma.comment.deleteMany({
            where:{parentId:commentId}
        })
        return this.prisma.comment.delete({
            where:{
                id:commentId
            }
        })
    }

    async  likeComment(commentId:number){
            return this.prisma.comment.update({
                where:{
                    id:commentId
                },
                data:{
                    likes:{
                        increment:1
                    }
                }
            })
    }

    async  dislikeComment(commentId:number){
        return this.prisma.comment.update({
            where:{
                id:commentId
            },
            data:{
                dislikes:{
                    increment:1
                }
            }
        })

    }
}
