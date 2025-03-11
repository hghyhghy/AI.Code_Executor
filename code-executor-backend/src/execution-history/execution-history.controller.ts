
import { Controller,Get,Req,UseGuards,Param,Delete } from '@nestjs/common';
import { ExecutionHistoryService } from './execution-history.service';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('execution-history')
export class ExecutionHistoryController {
    constructor(private readonly  executionHistoryController:ExecutionHistoryService){}

   @UseGuards(JwtAuthGuard)
   @Get("history")
   async getUserExecutionHistory(@Req() req:Request){
    const userId =  (req.user as any)?.id
    return this.executionHistoryController.getExecutionHistory(Number(userId))
   }

   @UseGuards(JwtAuthGuard)
   @Delete("delete-all")
   async deleteall(@Req() req:Request){
    const userId =  (req.user as any) ?.id
    return this.executionHistoryController.deleteExecutionHistory(Number(userId))
   }

   @UseGuards(JwtAuthGuard)
   @Delete('delete/:entryId')
   async deletespecific(@Req() req:Request ,  @Param('entryId') entryId:string){
    const userId =  (req.user as any) ?.id
    return this.executionHistoryController.deleteSpecificHistiory(
        Number(entryId),
        Number(userId)
    )
   }
}
