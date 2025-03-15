
import { Injectable , NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { UpdateUserProfileDto } from './user-profile.dto';


@Injectable()
export class UserProfileService {

    constructor(private  prisma:PrismaService){}

    async  getUserProfile(userId:number){

        const userprofile = await this.prisma.userprofile.findUnique({
            where:{
                userId:Number(userId)
            }
        })

        if (!userprofile){
            throw new  NotFoundException("profile not found")
        }

        const executecodecount  =  await this.prisma.executionHistory.count({
            where:{
                userId:Number(userId)
            }
        });

        return {...userprofile,executecodecount}
    }

    async  updateUserProfile(userId:number, updateData:UpdateUserProfileDto){
        return await this.prisma.userprofile.upsert({
                where:{
                    userId:Number(userId)
                },
                update:updateData,
                create:{userId,...updateData}
        })
    }

    async  deleteUserProfile(userId:number){
        const existinguser =  await this.prisma.userprofile.findUnique({
            where:{
                userId:Number(userId)
            }
        })

        if (!existinguser) {
            throw new NotFoundException('User profile not found');
        }

        await this.prisma.userprofile.delete({
            where:{
                userId:Number(userId)
            }
        });
        return { message: 'User profile deleted successfully' };

    
    }

}
