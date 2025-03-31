
import { Controller, Get, Post, Delete, Param, Body, Req, UseGuards,Patch, BadRequestException } from '@nestjs/common';
import { CommentService } from './comment.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Request } from 'express';

@Controller('comment')
export class CommentController {

    constructor(private readonly  commentservice:CommentService){}

    @UseGuards(JwtAuthGuard)
    @Get(':executionId')
    async getComments(@Param('executionId') executionId:string){
        return this.commentservice.getCommentsByCode(Number(executionId))
    }

    @UseGuards(JwtAuthGuard)
    @Post(':executionId')
    async  addComment(@Req() req:Request ,  @Param('executionId') executionId:string, @Body() body:{content:string, parentId?:number}){
    const userId =  (req.user as any) ?.id

        return this.commentservice.addComment(
                userId,
                Number(executionId),
                body.content,
            )

    }

    
    @UseGuards(JwtAuthGuard)
    @Post('reply/:executionId/:parentId')
    async addReply(
        @Param('executionId') executionId: string,
        @Param('parentId',) parentId: string,
        @Body() body: { content: string },
        @Req() req: Request
    ) {
        const userId = (req.user as any)?.id
        const execution =  parseInt(executionId,10)
        const parent =  parseInt(parentId,10)

    
        if (!body.content.trim()) {
            throw new BadRequestException('Reply content cannot be empty');
        }
    
        const reply = await this.commentservice.addreply(userId, execution, body.content, parent);
        return reply;
    }

    @UseGuards(JwtAuthGuard)
    @Delete(':commentId')
    async deleteComment(@Req() req:Request ,   @Param('commentId') commentId:string){
    const userId =  (req.user as any) ?.id

        return this.commentservice.deleteComment(
            Number(commentId),
            userId
        )
    }

    @UseGuards(JwtAuthGuard)
    @Patch('/like/:commentId')
    async  likeComment(@Param('commentId') commentId:string){
        return this.commentservice.likeComment(Number(commentId))
    }

    @UseGuards(JwtAuthGuard)
    @Patch('/dislike/:commentId')
    async  dislikeComment(@Param('commentId') commentId:string){
        return this.commentservice.dislikeComment(Number(commentId))
    }


}
