import { Module } from '@nestjs/common';
import { PublichistoryService } from './publichistory.service';
import { PublichistoryController } from './publichistory.controller';
import { PrismaService } from 'src/prisma.service';

@Module({
  providers: [PublichistoryService,PrismaService],
  controllers: [PublichistoryController]
})
export class PublichistoryModule {}
