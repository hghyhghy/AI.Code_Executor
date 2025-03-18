
import { Injectable,ForbiddenException  } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { EmailService } from 'src/common/email.service';

@Injectable()
export class SubscriptionService {

    constructor (
        private  prisma:PrismaService,
        private emailService:EmailService
    ) {}

    async  subscribe(userId:number, planType:string){
                // Check if the user is already subscribed
            const existingSubscription  =  await this.prisma.subscription.findUnique({
                where:{
                    userId:userId
                }
            });

            if(existingSubscription){
                throw  new ForbiddenException("You are already  subscribed")
            }
                    // Create a new subscription record
            await this.prisma.subscription.create({
                data:{
                    userId,
                    planType,
                    isActive:true,
                    subscribedAt:new Date()
                }
            })
            // sending confirmation mail
            const user =  await this.prisma.user.findUnique({
                where:{
                    id:userId
                }
            })
            if(user){
                await this.emailService.sendSubscriptionConfirmation(user.email, planType)
            }
            return {
                message:`Subscription successful to the ${planType} plan. API token limit removed.`
            }
    }

    async unsubscribe(userId:number){

        const existingsubscription = await this.prisma.subscription.findUnique({where:{userId:userId}})
        if(!existingsubscription){
            throw  new ForbiddenException("You are not subscribed yet ")
        }

        await this.prisma.subscription.delete({
            where:{userId:userId}
        })

        const apitoken  =  await this.prisma.apiToken.findMany({where:{userId:userId}})
        if(apitoken.length >  2){
            await this.prisma.apiToken.deleteMany({
                where:{userId:userId}
            })
        }

        const user  =  await this.prisma.user.findUnique({where:{id:userId}})
        if(user){
            await  this.emailService.sendUnsubscribeConfirmation(user.email)
        };
        return { message: 'You have unsubscribed. API token limit reinstated (max 2 tokens).' };
    

    }

    async  getSubscriptionStatus(userId:number){

        const subscription  =  await this.prisma.subscription.findUnique({
            where:{userId:userId}
        })
        return subscription
        ? { isSubscribed: true, planType: subscription.planType }
        : { isSubscribed: false };
    }
}
