
import { Controller, Post, Get, Param, Body,UseGuards, Req } from '@nestjs/common';
import { ShareService } from './share.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Request } from 'express';

@Controller('share')
export class ShareController {

    constructor(private  readonly shareService:ShareService){}
    
    @UseGuards(JwtAuthGuard)
    @Post('set')
    async shareCode( @Req() req:Request, @Body() {code,language,output}){
        const userId = (req.user as any)?.id;

        return this.shareService.shareCode( userId,code,language,output)
    }
    @UseGuards(JwtAuthGuard)
    @Get('status')
    async shareCodeStatus(@Req() req:Request){
        const userId = (req.user as any)?.id;
        return this.shareService.sharecCodeStatus(userId)
    }

    @Get(":codeId")
    async getSharedCode(@Param("codeId")  codeId:string){
        return this.shareService.getSharedCode(codeId)
    }
}
