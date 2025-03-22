
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { InterviewGeminiService } from 'src/interview-gemini/interview-gemini.service';
@Injectable()
export class InterviewService {

    constructor(
        private  prisma:PrismaService,
        private  interviewgeminiservice:InterviewGeminiService
    ) {}

    async generateAndSaveArticle(userId:number,topic:string,wordLimit:number,language:string){
        try {
            
            const content =  await this.interviewgeminiservice.generateBlog(topic,wordLimit,language)
            // save to  the database
            const article  =  await this.prisma.interviewContent.create({
                data:{
                    userId,
                    title:topic,
                    content

                }
            })
            return article
        } catch (error) {
            throw new Error("Error generating or saving article: " + error.message);

        }
    }

    async updateContent (userId:number,articleId:number, updatedContent:string){
        return  this.prisma.interviewContent.updateMany({
            where:{
                id:articleId,userId
            },
            data:{
                content:updatedContent
            }
        })
    }

    async updatetitle (userId:number,articleId:number, newTitle:string){
        return  this.prisma.interviewContent.updateMany({
            where:{
                id:articleId,userId
            },
            data:{
                title:newTitle,
            }
        })
    }

    async deleteArticle(userId:number,articleId:number){
        return  this.prisma.interviewContent.deleteMany({
            where:{
                id:articleId,userId
            }
        })
    }

    async getAllarticles(userId:number){
            return this.prisma.interviewContent.findMany({
                where:{
                    userId
                },
                orderBy:{
                    createdAt:"desc"
                }
            })
    }


}
