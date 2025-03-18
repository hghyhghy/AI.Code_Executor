import { Module } from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { SubscriptionController } from './subscription.controller';
import { PrismaService } from 'src/prisma.service';
import { EmailService } from 'src/common/email.service';

@Module({
  providers: [SubscriptionService,PrismaService,EmailService],
  controllers: [SubscriptionController]
})
export class SubscriptionModule {}
