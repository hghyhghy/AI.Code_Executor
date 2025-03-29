import { Module } from '@nestjs/common';
import { ExamGeminiService } from './exam-gemini.service';

@Module({
  providers: [ExamGeminiService]
})
export class ExamGeminiModule {}
