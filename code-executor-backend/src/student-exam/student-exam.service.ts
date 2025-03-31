
import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
@Injectable()
export class StudentExamService {

    private readonly ADMIN_SECRET_KEY='1111';
    constructor(private  prisma:PrismaService){}

    // validate admin  
    async  validateAdmin(secretkey:string){
        if(secretkey === this.ADMIN_SECRET_KEY){
            throw new UnauthorizedException('Invalid Admin key')
        }
    }

    // get all users for admin  only  
    async  getAllUsers(secretkey:string){
        await this.validateAdmin(secretkey)
        return await this.prisma.user.findMany({
            select:{
                id:true,
                name:true,
                email:true
            }
        })
    }

    // assign exam to the user admin only

    async assignExam(secretkey:string, userId:number,topic:string, questions:any[]){
        await this.validateAdmin(secretkey)
        if(questions.length !== 5){
            throw new BadRequestException('Exam must contain exactly 5 MCQ questions.');

        }

        return this.prisma.studentExam.create({
            data:{
                userId:userId,
                assignedBy:1,
                topic:topic,
                questions
            }
        })
    }

    // get users pending exam 
    async getUserExam(userId:number){
        return this.prisma.studentExam.findMany({
            where:{
                userId:userId,
                status:'pending'
            }
        })
    }

    // submit exam answers
    async  submitExam(userId:number,studentexamid:number,answers:any){
        const exam  =  await this.prisma.studentExam.findUnique({
            where:{
                id:studentexamid,
                userId:userId
            }
        })

        if(!exam){
            throw new BadRequestException('Exam not found or not assigned to  you')
        }

        return await this.prisma.studentExamAnswer.create({
            data:{
                studentExamId:studentexamid,
                userId:userId,
                answers
            }
        })
    }

    // evaluate exam  ans  assign marks 
    async evaluateExam(secretkey:string,studentexamid:number,score:number){
        await this.validateAdmin(secretkey)
        return  this.prisma.studentExamAnswer.updateMany({
            where:{studentExamId:studentexamid},
            data:{
                score:score,
                evaluated:true
            }
        })
    }

    async getExamResults(userId:number){
        return this.prisma.studentExamAnswer.findMany({
            where:{userId:userId,  evaluated:true},
            include:{studentExam:true}
        })
    }

}
