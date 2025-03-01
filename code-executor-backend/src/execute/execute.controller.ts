import { Controller, Post, Get, Body, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard'; // Ensure you have this guard for authentication
import { Request } from 'express';
import { ExecuteService } from './execute.service';


@Controller('execute')
export class ExecuteController {

    constructor(private readonly executeService:ExecuteService){}
    @UseGuards(JwtAuthGuard)
    @Post('code')
    async execute(@Req() req:Request , @Body() body:{code:string,language:string}){
        const userId = (req.user as any)?.id;
        return this.executeService.executeCode(userId,body.code,body.language)
    }

    @UseGuards(JwtAuthGuard)
    @Get('history')
    async getHistory(@Req() req:Request){
        const userId = (req.user as any)?.id
        return this.executeService.getExecutionHistory(userId)
    }

    @UseGuards(JwtAuthGuard)
    @Post('suggest')

    async suggestCode(@Body() body:{language:string,currentCode:string}){
        return this.executeService.suggestCode(body.language,body.currentCode)
    }
}
