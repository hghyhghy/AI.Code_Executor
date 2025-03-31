import { Module } from '@nestjs/common';
import { ExamService } from './exam.service';
import { ExamController } from './exam.controller';
import { PrismaService } from 'src/prisma.service';
import { ExamGeminiService } from 'src/exam-gemini/exam-gemini.service';

@Module({
  providers: [ExamService,PrismaService,ExamGeminiService],
  controllers: [ExamController]
})
export class ExamModule {}
