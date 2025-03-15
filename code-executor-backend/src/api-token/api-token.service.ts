
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { randomBytes } from "crypto";

@Injectable()
export class ApiTokenService {

    constructor(private prisma:PrismaService){}
    
    async  generateToken(userId:number){
        const  token = randomBytes(32).toString("hex")

        return  await this.prisma.apiToken.upsert({
            where:{userId:Number(userId)},
            update:{token},
            create:{userId,token}
        })
    }

    async  validateToken(token:string){
        const apitoken =  await this.prisma.apiToken.findUnique({
            where:{token:token}
        })

        return apitoken ? {valid:true} : {valid:false}
    }

    async  deleteToken(userId:number){
        await this.prisma.apiToken.deleteMany({
            where:{userId:Number(userId)}
        })
        return {message:"API token deleted successfully"}
    }

    async  fetchApiToken(userId:number){
        return await this.prisma.apiToken.findFirst({
            where: { userId: userId },
            orderBy:{createdAt:"desc"}
        })
    }

}
