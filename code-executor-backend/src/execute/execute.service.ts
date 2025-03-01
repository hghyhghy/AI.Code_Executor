
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { GeminiService } from 'src/gemini/gemini.service';


@Injectable()
export class ExecuteService {

    constructor(
        private readonly prisma:PrismaService,
        private readonly  geminiService:GeminiService
    ) {}

    async  executeCode(userId:number,code:string,language:string){
        if (!code || !language) {
            return 'Code or language is missing'
        }

        const result =   await this.geminiService.executeCode(code,language)
        const execution = await this.prisma.executionHistory.create({
            data:{

                userId:Number(userId),
                code,
                language,
                output:result
            }
        });

        return {output:execution.output, id:execution.id}
    }

    async  getExecutionHistory(userId:number){
        return  await this.prisma.executionHistory.findMany({
            where:{userId:Number(userId)},
            orderBy:{createdAt:'desc'}
        })
    }
}
