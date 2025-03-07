import { Module } from '@nestjs/common';
import { CollaborationGateway } from './collaboration.gateway';
import { CollaborationService } from './collaboration.service';

@Module({
  providers: [CollaborationGateway, CollaborationService],
})
export class CollaborationModule {}
