import { Module } from '@nestjs/common';
import { InterviewService } from './interview.service';
import { InterviewController } from './interview.controller';
import { PrismaService } from 'src/prisma.service';
import { InterviewGeminiService } from 'src/interview-gemini/interview-gemini.service';
@Module({
  providers: [InterviewService,PrismaService,InterviewGeminiService],
  controllers: [InterviewController]
})
export class InterviewModule {}
