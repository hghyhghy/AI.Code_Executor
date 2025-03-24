
import { Injectable,NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';


@Injectable()
export class ShareService {

    constructor(private prisma:PrismaService){}

    // nest js code for sharing ID  
    async  shareCode(userId:number,code:string,language:string,output?:string){
        const userExists  = await this.prisma.user.findUnique ({
            where :{
                id:userId
            }
        })
        if (!userExists) {
            throw new Error(`User with ID ${userId} does not exist.`);
          }
        const sharedCode =  await this.prisma.sharedCode.create({
            data:{
                userId:Number(userId),
                code:code,
                language:language,
                output:output
            }
        });

        return { link: `http://localhost:3001/share/${sharedCode.id}`,
            id: sharedCode.id,   // Include ID for direct retrieval
            code: sharedCode.code,
            language: sharedCode.language,
            output: sharedCode.output,
         };
    }

    // retrieve the code snippet from their ID

    async getSharedCode(codeId:string){
        const sharedCode =  await this.prisma.sharedCode.findUnique({
            where:{
                id:codeId
            }
        })

        if (!sharedCode) throw new NotFoundException("Source code snippet not found")
        
        return sharedCode
    }

    

}
