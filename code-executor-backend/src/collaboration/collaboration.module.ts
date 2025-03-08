import { Module } from '@nestjs/common';
import { CollaborationGateway } from './collaboration.gateway';
import { CollaborationService } from './collaboration.service';
import { PrismaService } from 'src/prisma.service';

@Module({
  providers: [CollaborationGateway, CollaborationService,PrismaService],
  
})
export class CollaborationModule {}
