
import { Injectable,ForbiddenException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { randomBytes } from "crypto";

@Injectable()
export class ApiTokenService {

    constructor(private prisma:PrismaService){}
    
    async generateToken(userId: number) {
        const tokenHistoryCount = await this.prisma.apiToken.count({
            where: { userId: userId }
        });

        if (tokenHistoryCount >= 2) {
            throw new ForbiddenException('You have reached your API token generation limit (2). You cannot create more tokens.');
        }

        let token: string = ""
        let isUnique = false;

        // Ensure the token is unique
        while (!isUnique) {
            token = randomBytes(32).toString("hex");

            const existingToken = await this.prisma.apiToken.findUnique({
                where: { token: token }
            });

            if (!existingToken) {
                isUnique = true;
            }
        }

        try {
            return await this.prisma.apiToken.create({
                data: {
                    userId,
                    token
                }
            });
        } catch (error) {
            throw new InternalServerErrorException('Failed to generate API token. Please try again.');
        }
    }


    async  validateToken(token:string){
        const apitoken =  await this.prisma.apiToken.findUnique({
            where:{token:token}
        })

        return apitoken ? {valid:true} : {valid:false}
    }

    async  deleteToken(userId:number){
        await this.prisma.apiToken.deleteMany({
            where:{userId:userId}
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
