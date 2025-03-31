import { Module } from '@nestjs/common';
import { StudentExamService } from './student-exam.service';
import { StudentExamController } from './student-exam.controller';
import { PrismaService } from 'src/prisma.service';

@Module({
  providers: [StudentExamService,PrismaService],
  controllers: [StudentExamController]
})
export class StudentExamModule {}
