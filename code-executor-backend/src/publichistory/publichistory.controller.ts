
import { Controller, Get } from '@nestjs/common';
import { PublichistoryService } from './publichistory.service';
@Controller('publichistory')
export class PublichistoryController {

    constructor(private readonly  publichistory:PublichistoryService){}

    @Get('history')
    async getAllExecutions(){
        return this.publichistory.getAllExecutionHistories()
    }
}
