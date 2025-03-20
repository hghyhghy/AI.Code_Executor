
import { Injectable,HttpException,HttpStatus } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import axios from 'axios';

@Injectable()
export class GithubService {

    constructor(private prisma:PrismaService){}
    //fetching all file name from the user  
    async getUserFiles(userId: number) {

         const files =  await this.prisma.file.findMany({
          where: {
            folder: {
              userId,
            },
          },
          select: {
            id: true,
            name: true,
            folder: {
              select: {
                name: true, 
                user:{
                    select:{
                        name:true,
                        email:true
                        // Folder Name
                    },
                },
            },
          }
    }})
    

        const filesWithExecution  =await Promise.all(
            files.map(async(file) => {
                const execution = await this.prisma.executionHistory.findUnique({
                    where:{id:file.id,
                    },

                    select:{
                        language:true,
                        createdAt:true
                    }
                    
                });
                const executionCount =  await this.prisma.executionHistory.count({
                    where:{id:file.id}
                })

                return{
                    id:file.id,
                    name:file.name,
                    folder:file.folder,
                    username:file.folder.user.name,
                    email:file.folder.user.email,
                    executionCount:executionCount,
                    execution:execution || null
                }

            })
        )
        console.log(filesWithExecution)
        return filesWithExecution
     }

    async searchFiles(userId:number,searchQuery:string,languageQuery:string){
        const files =  await this.prisma.file.findMany({
            where:{
                folder:{
                    userId
                },
                name:searchQuery ?{
                    contains:searchQuery,
                }: undefined
            },

            select:{
                    id:true,
                    name:true,
                    folder:{
                        select:{
                            name:true,
                            user:{
                                select:{
                                    name:true,
                                    email:true
                                }
                            }
                        }
                    }
            }
        })

        const filesWithExecution = await Promise.all(
            files.map(async (file) => {
              const execution = await this.prisma.executionHistory.findFirst({
                where: {
                  fileId: file.id,
                  language: languageQuery
                    ? {
                        equals: languageQuery, // Search by execution language
                      }
                    : undefined,
                },
                orderBy: { createdAt: 'desc' }, // Get latest execution
                select: {
                  language: true,
                  createdAt: true,
                },
              });
        
              const executionCount = await this.prisma.executionHistory.count({
                where: { fileId: file.id },
              });
        
              return {
                id: file.id,
                name: file.name,
                folder: file.folder.name,
                username: file.folder.user.name,
                email: file.folder.user.email,
                executionCount: executionCount,
                execution: execution || null,
              };
            })
          );
        
          return filesWithExecution;
    }

    async pushFileToGitHub(
        userId:number,
        pat:string,
        owner:string,
        repo:string,
        filePath:string,
        commitMessage:string
    ) {
        try {
            console.log("Pushing file:", { userId, pat, owner, repo, filePath, commitMessage });
            const file =  await this.prisma.file.findFirst({
                where:{
                    name:filePath,
                    folder:{
                        userId
                    }
                }
            })

            if (!file){
                throw new HttpException('File not found',HttpStatus.NOT_FOUND)
            }
            const encodedContent =Buffer.from(file.content,'utf-8').toString('base64')
            const fileUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`;
                  // Check if file exists to get SHA
            let sha=null
            try {
                const response = await axios.get(fileUrl,{
                    headers:{
                        Authorization:`Bearer ${pat}`
                    }
                });
                sha=response.data.sha
            } catch (error) {
                if(error.response?.status !== 404){
                        throw new HttpException("Github api error", HttpStatus.INTERNAL_SERVER_ERROR)
                }
            }
            const data={
                message:commitMessage,
                content:encodedContent,
                sha:sha||undefined
            }

            await axios.put(fileUrl,data,{
                headers:{
                    Authorization:`Bearer ${pat}`
                }
            })
            console.log("file successfully pushed")
            return{message:"File pushed successfully to the github "}

        } catch (error) {
            throw new HttpException(
                error.response?.data?.message || 'Failed to push file',
                HttpStatus.INTERNAL_SERVER_ERROR,
              );
        }
    }
}
