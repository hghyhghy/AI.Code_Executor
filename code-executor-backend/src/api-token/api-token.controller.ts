
import { Controller, Post, Delete, Body, Req, UseGuards, Get } from "@nestjs/common";
import { ApiTokenService } from "./api-token.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { Request } from "express";

@Controller('api-token')
export class ApiTokenController {

    constructor(private readonly  apitokeservice:ApiTokenService){}

    @UseGuards(JwtAuthGuard)
    @Post('generate')
    async  generateApitoken(@Req() req:Request){
        const userId   =  (req.user as any)?.id
        return  this.apitokeservice.generateToken(userId)
    }

    @Post('validate')
    async  validatetoken(@Body('token') token:string){
        return this.apitokeservice.validateToken(token)
    }

    @Delete('delete')
    async deleteToken(@Req() req:Request){
        const userId =  (req.user as any)?.id
        return  this.apitokeservice.deleteToken(userId)
    }

    @Get('get')
    async  fetchapitoken(@Req() req:Request){
        const userId =  (req.user as any)?.id
        const tokenRecord  = await   this.apitokeservice.fetchApiToken(userId)
        if (!tokenRecord) {
            return { token: "" }; // Return empty token if not found
        }
        return {token:tokenRecord.token}
    }
}
