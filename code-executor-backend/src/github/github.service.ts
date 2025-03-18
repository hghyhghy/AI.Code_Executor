
import { Injectable,HttpException,HttpStatus } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import axios from 'axios';

@Injectable()
export class GithubService {

    constructor(private prisma:PrismaService){}
    //fetching all file name from the user  
    async getUserFiles(userId:number){

        return await this.prisma.file.findMany({
            where:{
                folder:{
                    userId
                }
            },
            select:{
                id:true,
                name:true
            }
            
        })
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
            
            return{message:"File pushed successfully to the github "}

        } catch (error) {
            throw new HttpException(
                error.response?.data?.message || 'Failed to push file',
                HttpStatus.INTERNAL_SERVER_ERROR,
              );
        }
    }
}
