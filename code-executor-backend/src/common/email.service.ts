
import {  Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';



@Injectable()
export class EmailService{
    private transporter =  nodemailer.createTransport({
      host:"smtp.gmail.com",
      port:465,
      secure:true,
      auth:{
        user:"sarkarsubham624@gmail.com",
        pass:"zelr wjnu tpcf qctp"

      }
    })

    async  sendSubscriptionConfirmation(to:string,planType:string){

      return this.transporter.sendMail({
        from:"Code.ai",
        to,
        subject:"Subscription Confirmation",
        text: `Dear user,\n\nYou have unsubscribed from our service. Your API token limit has been reinstated to 2 tokens.\n\nIf this was a mistake, you can resubscribe anytime.\n\nBest regards,\nYour Team`

      })
    }

    async  sendUnsubscribeConfirmation(to:string){
      return this.transporter.sendMail({
        from:"Code.ai",
        to,
        subject:"Unsubscription Confirmation",
        text:`Dear user,\n\nYou have unsubscribed from our service. Your API token limit has been reinstated to 2 tokens.\n\nIf this was a mistake, you can resubscribe anytime.\n\nBest regards,\nYour Team`
      })
    }
}