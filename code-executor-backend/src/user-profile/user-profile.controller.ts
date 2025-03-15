
import { Controller, Get, Patch, Body, UseGuards, Req, Delete } from '@nestjs/common';
import { UserProfileService } from './user-profile.service';
import { UpdateUserProfileDto } from './user-profile.dto';
import { Request } from 'express';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('user-profile')
export class UserProfileController {

    constructor(private  readonly userProfileService:UserProfileService){}

    @UseGuards(JwtAuthGuard)
    @Get('profile')
    async getProfile(@Req() req:Request){
        const userId = (req.user as any)?.id;
        return  this.userProfileService.getUserProfile(Number(userId))
    }

    @UseGuards(JwtAuthGuard)
    @Patch("update")
    async updateProfile (@Req() req:Request  ,  @Body() updateprofiledto:UpdateUserProfileDto){
        const userId = (req.user as any)?.id;
        return this.userProfileService.updateUserProfile(Number(userId),  updateprofiledto)
    }

    @UseGuards(JwtAuthGuard)
    @Delete('delete')
    async deleteProfile(@Req()  req:Request){
        const userId = (req.user as any)?.id;
        return this.userProfileService.deleteUserProfile(Number(userId))
    }

}
