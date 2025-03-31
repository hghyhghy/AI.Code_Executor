
import { Controller, Post, Body, Param, Req, UseGuards, Get, Delete } from '@nestjs/common';
import { ExamService } from './exam.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Request } from 'express';
@Controller('exam')
export class ExamController {
    constructor(
        private readonly examService:ExamService
    ){}

    @UseGuards(JwtAuthGuard)
    @Post('generate')
    async generate (@Req() req:Request ,  @Body('topic') topic:string){
        const userID =  (req.user as any)?.id
        return this.examService.generateQuestions(userID,topic)
    }

    @UseGuards(JwtAuthGuard)
    @Post('evaluate/:examId')
    async evaluate(@Req() req:Request, @Param('examId') examId:string, @Body('answers') answers:any){
        const parsedexamId = parseInt(examId, 10);
        const userID =  (req.user as any)?.id
        return this.examService.evaluateAnswers(userID,parsedexamId,answers)
    }

    @UseGuards(JwtAuthGuard)
    @Delete('delete/:examId')
    async deleteexma(@Req() req:Request,   @Param('examId') examId:string){
        const parseexamid =   parseInt(examId,10)
        const userId =  (req.user as any)?.id
        return  this.examService.deleteExamHistory(userId,parseexamid)
    }

    @UseGuards(JwtAuthGuard)
    @Get('result')
    async getUserResult(@Req() req:Request){
        const userID =  (req.user as any)?.id
        return this.examService.getUserExamResults(userID)
    }

}
