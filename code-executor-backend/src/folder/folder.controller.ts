

import { Controller, Post, Get, Delete, Body, Param, HttpException, HttpStatus,UseGuards,Req } from '@nestjs/common';
import { Request } from 'express';
import { FolderService } from './folder.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('folder')
@UseGuards(JwtAuthGuard)
export class FolderController {

    constructor(private readonly folderService:FolderService){}
    @Post('create')
    async createFolder(@Req() req:Request , @Body() body:{name:string}){

        try {

            const userId = (req.user as any)?.id;
            const folder =  await this.folderService.createFolder(body.name,userId)
            return { message: 'Folder created successfully', folder };
            
        } 
        catch (error) {
            throw new HttpException('Folder creation failed', HttpStatus.BAD_REQUEST);
            
        }

    }

    @Get('find')
    async getUserFolders(@Req() req:Request){
        try {

            const userId =  (req.user as any)?.id
            const folders =  await this.folderService.getFolders(userId)
            return { message: 'Folders retrieved successfully', folders };
        }
         catch (error) {
            throw new HttpException('Failed to fetch folders', HttpStatus.INTERNAL_SERVER_ERROR);
    
        }
    }

    @Delete(':folderId')
    async deleteFolder(@Req() req:Request, @Param('folderId') folderId:number){
        
        try {

            const userId =  (req.user as any)?.id
            const deleted =  await this.folderService.deleteFolder(folderId,userId)
            if (!deleted) throw new HttpException('Folder not found', HttpStatus.NOT_FOUND);
            return { message: 'Folder deleted successfully' };
        } 
        catch (error) {
            throw new HttpException('Folder deletion failed', HttpStatus.BAD_REQUEST);

        }
    }

}

