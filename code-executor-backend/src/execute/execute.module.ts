import { Module } from '@nestjs/common';
import { ExecuteController } from './execute.controller';
import { ExecuteService } from './execute.service';
import { PrismaService } from 'src/prisma.service';
import { GeminiService } from 'src/gemini/gemini.service';

@Module({
  controllers: [ExecuteController],
  providers: [ExecuteService,PrismaService,GeminiService]
})
export class ExecuteModule {}
