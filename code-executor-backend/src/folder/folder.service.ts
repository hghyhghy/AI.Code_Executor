
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import * as fs from 'fs-extra';
import { join } from 'path';

@Injectable()
export class FolderService {
    private storagePath = join(__dirname,'../../storage')

    constructor(private prisma:PrismaService){
        fs.ensureDirSync(this.storagePath)
    }

    async  createFolder(name:string,userId:number){
        const folderPath =  join(this.storagePath,name)
        if(fs.existsSync(folderPath)) throw  new Error("Folder Already Exists Try Different Name")
        
        fs.mkdirSync(folderPath)
        return this.prisma.folder.create({ data:{name,userId}})
    }

    async  getFolders(userId:number){
        return this.prisma.folder.findMany({
            where:{
                userId
            }
        })
    }

    async deleteFolder(folderId:number,userId:number){
        const folder  =  await this.prisma.folder.findUnique({where:{id:folderId}})
        if (!folder) throw new NotFoundException('Folder not found');

        const folderPath =  join(this.storagePath,folder.name)
        fs.removeSync(folderPath)
        return this.prisma.folder.delete({where:{id:folderId}})
    }
}
