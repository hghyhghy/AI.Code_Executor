
import { Injectable,HttpException,HttpStatus } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import axios from 'axios';
import { Code } from 'typeorm';

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
                name: true, // Folder Name
              },
            },
            // Removed execution property as it does not exist in the type
          },
        });

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

                return{
                    id:file.id,
                    name:file.name,
                    folder:file.folder,
                    execution:execution || null
                }

            })
        )
        console.log(filesWithExecution)
        return filesWithExecution
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
