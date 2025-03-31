import { Controller, Get, Post, Body, Query, Param, Req, UseGuards, BadRequestException } from '@nestjs/common';
import { StudentExamService } from './student-exam.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Request } from 'express';
@Controller('student-exam')
export class StudentExamController {
    constructor(private  readonly studentexamservice:StudentExamService){}

    @UseGuards(JwtAuthGuard)
    @Get('users')
    async  getAllusers(@Query('secretkey') secretkey:string){
        return this.studentexamservice.getAllUsers(secretkey)
    }

    @Post('assign')
    @UseGuards(JwtAuthGuard)
    async  assignExam(@Req() req:Request,    @Body('secretkey') secretkey:string, @Body('topic') topic:string, @Body('questions') questions:any[] ){
        const userId1 =  (req.user as any)?.id

        return this.studentexamservice.assignExam(secretkey,Number(userId1),topic,questions)
    }

    @UseGuards(JwtAuthGuard)
    @Get('pending')
    async  getUSerExam(@Req() req:Request){
        const userId1 =  (req.user as any)?.id
        return  this.studentexamservice.getUserExam(userId1)
    }
    
    @UseGuards(JwtAuthGuard)
    @Post('submit')
    async submitExam(@Req() req:Request,  @Body('studentexamid') studentexamid:number,  @Body('answers') answers:any){
        const userId =  (req.user as any)?.id
        return this.studentexamservice.submitExam(userId,studentexamid,answers)
    }
    
    @UseGuards(JwtAuthGuard)
    @Post('evaluate')
    async evaluateExam(
        @Body('secretkey') secretkey: string,
        @Body('studentexamid') studentExamId: number,
        @Body('score') score: number
    ) {
        if (score < 0 || score > 100) {
            throw new BadRequestException('Score must be between 0 and 100.');
        }
        return this.studentexamservice.evaluateExam(secretkey, studentExamId, score);
    }

    // ✅ Add Get Exam Results Endpoint (For Students)
    @UseGuards(JwtAuthGuard)
    @Get('results')
    async getExamResults(@Req() req: Request) {
        const userId = (req.user as any)?.id;
        return this.studentexamservice.getExamResults(userId);
    }


}
