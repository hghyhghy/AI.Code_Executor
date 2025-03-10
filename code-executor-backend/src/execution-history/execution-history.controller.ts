
import { Controller,Get,Req,UseGuards } from '@nestjs/common';
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
}
