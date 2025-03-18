

import { Controller, Get, Post, Body, Req, UseGuards, Res } from '@nestjs/common';
import { GithubService } from './github.service';
import { AuthGuard } from '@nestjs/passport';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Request } from 'express';
@Controller('github')
export class GithubController {

    constructor(private readonly githubservice:GithubService){}

    @UseGuards(JwtAuthGuard)
    @Get('files')
    async getUserFIles(@Req() req:Request){
        const userId= (req.user as any)?.id
        return this.githubservice.getUserFiles(userId)
    }

    @UseGuards(JwtAuthGuard)
    @Post('push')
    async pushFileToGithub(@Req() req:Request ,  @Body() body){
        const { pat,owner,repo,filePath,commitMessage} =  body
        const userId= (req.user as any)?.id
        return this.githubservice.pushFileToGitHub(userId,pat,owner,repo,filePath,commitMessage)
    }
}
