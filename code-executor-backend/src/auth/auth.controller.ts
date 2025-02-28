


import { Controller, Post, Body, NotFoundException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('register')
    async register(@Body() Body){
        return this.authService.register(Body.email,Body.password,Body.name)
    }

    @Post('login')
    async login(@Body() Body){
        const user  =  await this.authService.validateUser(Body.name,Body.password)
        if(!user){
            throw new NotFoundException('Invalid credentials')
        }

        return this.authService.login(Body.name,Body.password)
    }
}
