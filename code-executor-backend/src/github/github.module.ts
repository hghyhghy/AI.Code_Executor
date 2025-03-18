import { Module } from '@nestjs/common';
import { GithubService } from './github.service';
import { GithubController } from './github.controller';
import { PrismaService } from 'src/prisma.service';

@Module({
  providers: [GithubService,PrismaService],
  controllers: [GithubController]
})
export class GithubModule {}
