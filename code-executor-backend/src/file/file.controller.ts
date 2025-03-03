
import {
    Controller,
    Post,
    Get,
    Put,
    Delete,
    Body,
    Param,
    UseGuards,
    HttpException,
    HttpStatus,
    Req,
  } from '@nestjs/common';
  import { FileService } from './file.service';
  import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Request } from 'express';

@Controller('file')
@UseGuards(JwtAuthGuard)
export class FileController {

    constructor(private  readonly fileService:FileService){}

    @Post('create')
    async createFile( @Req() req:Request , @Body() body:{folderId:number, name:string ,content:string}){
        const userId = (req.user as any)?.id;
        if (!body.folderId || !body.name) {
            throw new HttpException('Missing required fields', HttpStatus.BAD_REQUEST);
          }
        return  this.fileService.createFile(userId,body.folderId,body.name,body.content)

    }
    @Get('folder/:folderId')
    async  getFilesInFolder(@Req() req:Request , @Param('folderId') folderId:string){

        const id = parseInt(folderId, 10);
        const userId = (req.user as any)?.id;

        return this.fileService.getFilesInFolder(userId,id)

    }
     // Get a specific file's content
    @Get(':folderId/:fileName')
    async  getFileContent(@Req() req:Request , @Param('folderId') folderId:string,  @Param('fileName') fileName:string){
        const id = parseInt(folderId, 10);
        const userId = (req.user as any)?.id;
        
        return this.fileService.getFileContent(userId,id,fileName)
    }

    @Put('update')
    async updateFile( @Req() req:Request , @Body()  body:{folderId:number, fileName:string , content:string}  ){
        const userId = (req.user as any)?.id;

        if (!body.folderId || !body.fileName || !body.content) {
            throw new HttpException('Missing required fields', HttpStatus.BAD_REQUEST);
          }
        return this.fileService.updateFileContent(userId,body.folderId,body.fileName,body.content)
    }

    @Delete('delete')
    async  deleteFile( @Req() req:Request , @Body()  body:{folderId:number, fileName:string}){
        const userId = (req.user as any)?.id;
        if (!body.folderId || !body.fileName) {
            throw new HttpException('Missing required fields', HttpStatus.BAD_REQUEST);
          }
        
        return this.fileService.deleteFile(userId,body.folderId,body.fileName)
    }




}
