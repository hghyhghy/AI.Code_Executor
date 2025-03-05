
import { Injectable ,HttpException , HttpStatus } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class FileService {

    constructor(private  prisma:PrismaService){}

    async  createFile(userId:number,folderId:number,name:string,content:string){
        const folder =  await this.prisma.folder.findFirst({
            where:{id:folderId,userId}
        })

        if(!folder){
            throw new HttpException('Folder not found or unauthorized', HttpStatus.FORBIDDEN)
        }

        return this.prisma.file.create({
            data:{
                name,content,folderId
            }
        })
    }

      // Get all files inside a specific folder
    
    async  getFilesInFolder(userId:number,folderId:number){
         // Ensure the folder belongs to the user

         const folder  =  await this.prisma.folder.findFirst({
            where:{id:folderId,userId}
         })

         if(!folder){
            throw new HttpException('Folder not found or unauthorized', HttpStatus.FORBIDDEN);
         }

        return this.prisma.file.findMany({
            where:{folderId},
            select:{
                id:true,
                name:true,
                content:true
            }
        })
    }

   // get file content 
   
   async getFileContent(userId:number, folderId:number,fileName:string){
    const folder   =  await this.prisma.folder.findFirst({
        where:{id:folderId, userId}
    })
    if (!folder) {
        throw new HttpException('Folder not found or unauthorized', HttpStatus.FORBIDDEN);
      }

        // Fetch the file
    const file  =  await this.prisma.file.findFirst({
        where:{folderId,name:fileName}
    })
    if (!file) {
        throw new HttpException('File not found', HttpStatus.NOT_FOUND);
      }

    return {folderId:file.folderId, id:file.id,name:file.name,content:file.content

        // these backend error is fixed which is now returning the  folderID 
    }
    
   }

     // Update a file's content
    
    async updateFileContent(userId:number,folderId:number,fileName:string,content:string){
        const folder =  await this.prisma.folder.findFirst({
            where:{id:folderId,userId}
        })

        if (!folder) {
            throw new HttpException('Folder not found or unauthorized', HttpStatus.FORBIDDEN);
          }

        const file =  await this.prisma.file.findFirst({
            where:{
                folderId,
                name:fileName
            }
        })

        if (!file) {
            throw new HttpException('File not found', HttpStatus.NOT_FOUND);
        }

        return this.prisma.file.update({
            where:{
                id:file.id
            },

            data:{
                content:content
            }
        })
    }

    // Delete a file
    async  deleteFile(userId:number,folderId:number,fileName:string){
        const folder =  await this.prisma.folder.findFirst({
            where:{
                id:folderId,
                userId
            }
        })

        if (!folder) {
            throw new HttpException('Folder not found or unauthorized', HttpStatus.FORBIDDEN);
          }
        
        const file =  await this.prisma.file.findFirst({
            where:{
                folderId,
                name:fileName
            }
        }) 
        if (!file) {
            throw new HttpException('File not found', HttpStatus.NOT_FOUND);
          }
        await this.prisma.file.delete({
            where:{
                id:file.id
            }
        })
    }


}
