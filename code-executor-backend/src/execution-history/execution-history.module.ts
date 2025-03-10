import { Module } from '@nestjs/common';
import { ExecutionHistoryService } from './execution-history.service';
import { ExecutionHistoryController } from './execution-history.controller';
import { PrismaService } from 'src/prisma.service';

@Module({
  providers: [ExecutionHistoryService,PrismaService],
  controllers: [ExecutionHistoryController]
})
export class ExecutionHistoryModule {}
