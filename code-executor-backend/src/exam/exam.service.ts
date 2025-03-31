import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { ExamGeminiService } from 'src/exam-gemini/exam-gemini.service';

@Injectable()
export class ExamService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly examGeminiService: ExamGeminiService
    ) {}

    async generateQuestions(userId: number, topic: string) {
        const questions = await this.examGeminiService.generateExamQuestions(topic);

        const exam = await this.prisma.exam.create({
            data: {
                userId,
                topic,
                questions, 
            },
        });

        return {
            message: "Questions generated successfully",
            examId: exam.id, 
            questions,
        };
    }

    async evaluateAnswers(userId: number, examId: number, studentAnswers: any) {
        const exam = await this.prisma.exam.findUnique({
            where: { id: examId },
            select: { questions: true },
        });
         console.log(examId)

        if (!exam) {
            throw new NotFoundException("Exam not found");
        }
        if (!exam.questions || !Array.isArray(exam.questions)) {
            throw new Error("Invalid or missing questions in the exam record.");
        }
    

        const score = await this.examGeminiService.evaluateAnswers(exam.questions, studentAnswers);

        const result = await this.prisma.examAnswer.create({
            data: {
                userId,
                examId,
                answers: studentAnswers, 
                score,
                evaluated: true,
            },
        });

        return {
            message: "Exam evaluated successfully",
            examId,
            score,
        };
    }

    async getUserExamResults(userId:number){
        const results  =  await this.prisma.examAnswer.findMany({
            where:{userId:userId},
            include:{
                exam:{
                    select:{
                        topic:true,
                        createdAt:true
                    }
                }
            }
        })

        if(!results.length){
            throw new NotFoundException("No exams found for this user ")
        }

        return results.map(result => ({
            examId:result.examId,
            topic:result.exam.topic,
            answer:result.answers,
            score:result.score,
            evaluated:result.evaluated,
            date:result.exam.createdAt
        }))
    }

    async deleteExamHistory(userId:number,examId:number){
        const deleted =  await this.prisma.examAnswer.deleteMany({
            where:{
                userId:userId,
                examId:examId
            }
        })
        if(!deleted.count){
            throw new NotFoundException("No exam found to delete")
        }

        return {
            message:` Exam with id ${examId}  deleted successfully`
        }
        
    }
}
