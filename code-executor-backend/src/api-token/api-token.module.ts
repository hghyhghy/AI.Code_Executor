import { Module } from '@nestjs/common';
import { ApiTokenService } from './api-token.service';
import { ApiTokenController } from './api-token.controller';
import { PrismaService } from 'src/prisma.service';

@Module({
  providers: [ApiTokenService,PrismaService],
  controllers: [ApiTokenController]
})
export class ApiTokenModule {}
