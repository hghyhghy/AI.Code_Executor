import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ExecuteModule } from './execute/execute.module';
import { GeminiService } from './gemini/gemini.service';
import { FolderModule } from './folder/folder.module';
import { FileModule } from './file/file.module';
import { ShareModule } from './share/share.module';
import { CollaborationGateway } from './collaboration/collaboration.gateway';
import { CollaborationService } from './collaboration/collaboration.service';
import { CollaborationModule } from './collaboration/collaboration.module';
import { PrismaService } from './prisma.service';

@Module({
  imports: [AuthModule, ExecuteModule, FolderModule, FileModule, ShareModule, CollaborationModule],
  controllers: [AppController],
  providers: [AppService, GeminiService, CollaborationGateway, CollaborationService,PrismaService],
})
export class AppModule {}
