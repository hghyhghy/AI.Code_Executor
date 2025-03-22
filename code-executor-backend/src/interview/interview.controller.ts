import { Controller, Get, Post, Put, Delete, Body, Req, Param, UseGuards } from '@nestjs/common';
import { InterviewService } from './interview.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Request } from 'express';

@Controller('interview')
export class InterviewController {
    constructor(private readonly interviewService:InterviewService){}

    @UseGuards(JwtAuthGuard)
    @Post('generate')
    async generatearticle(@Req() req:Request,  
    @Body('topic') topic:string,
    @Body('wordLimit') wordLimit:number,
    @Body('language') language:string



    ){
        const userId =  (req.user as any)?.id
        return this.interviewService.generateAndSaveArticle(userId,topic,wordLimit,language)
    }

    @UseGuards(JwtAuthGuard)
    @Put('update/title/:articleId')
    async updateTitle(
        @Req() req:Request,
        @Param('articleId') articleId:string,
        @Body('title') title:string,
    ){

        const userId= (req.user as any)?.id
        const parsedArticleId = parseInt(articleId, 10);
        return  this.interviewService.updatetitle(userId,parsedArticleId,title)

    }

    @UseGuards(JwtAuthGuard)
    @Put('update/content/:articleId')
    async updateContent(
        @Req() req:Request,
        @Param('articleId') articleId:string,
        @Body('content') content:string
    ){

        const userId= (req.user as any)?.id
        const parsedArticleId = parseInt(articleId, 10);
        return  this.interviewService.updateContent(userId,parsedArticleId,content)

    }

    @UseGuards(JwtAuthGuard)
    @Delete('delete/:articleId')
    async deleteArticle(@Req() req: Request, @Param('articleId') articleId: string) {
 
        const userId= (req.user as any)?.id
        const parsedArticleId = parseInt(articleId, 10);
        return this.interviewService.deleteArticle(userId,parsedArticleId)
    }

    @UseGuards(JwtAuthGuard)
    @Get('my-articles')
    async getArticles(@Req() req:Request){
        const userId= (req.user as any)?.id
        return this.interviewService.getAllarticles(userId)
    }
}
