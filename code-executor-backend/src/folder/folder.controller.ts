

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

    @Delete('delete/:folderId')
    // remenber parameter is always a string
    async deleteFolder(@Req() req: Request, @Param('folderId') folderId: string) {
        try {
            const userId = (req.user as any)?.id;
            const id = parseInt(folderId, 10); // Convert folderId to number
    
            if (isNaN(id)) {
                throw new HttpException('Invalid folder ID', HttpStatus.BAD_REQUEST);
            }
    
            const deleted = await this.folderService.deleteFolder(id, userId);
            if (!deleted) throw new HttpException('Folder not found', HttpStatus.NOT_FOUND);
    
            return { message: 'Folder deleted successfully' };
        } catch (error) {
            console.error(error);
            throw new HttpException('Folder deletion failed', HttpStatus.BAD_REQUEST);
        }
    }
    

}

