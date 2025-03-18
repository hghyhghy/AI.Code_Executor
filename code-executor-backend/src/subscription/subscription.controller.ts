
import { Controller, Post, Delete, Get, Param, Body,UseGuards, Req } from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Request } from 'express';


@Controller('subscription')
export class SubscriptionController {

    constructor(private readonly  subscriptionService:SubscriptionService){}

    @UseGuards(JwtAuthGuard)
    @Post('subscribe')
    async subscribe(@Req() req:Request,@Body() body:{planType:string}){
        const userId =  (req.user as any)?.id
        return this.subscriptionService.subscribe(userId,body.planType)

    }

    @UseGuards(JwtAuthGuard)
    @Delete('unsubscribe')
    async  unsubscribe(@Req() req:Request){
        const userId  = (req.user as any)?.id
        return this.subscriptionService.unsubscribe(userId)
    }

    @UseGuards(JwtAuthGuard)
    @Get('status')
    async getstatus(@Req() req:Request){
        const userId = (req.user as any)?.id
        return this.subscriptionService.getSubscriptionStatus(userId)
    }
}
