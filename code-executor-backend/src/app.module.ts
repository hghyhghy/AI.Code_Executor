import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ExecuteModule } from './execute/execute.module';
import { GeminiService } from './gemini/gemini.service';
import { FolderModule } from './folder/folder.module';
import { FileModule } from './file/file.module';

@Module({
  imports: [AuthModule, ExecuteModule, FolderModule, FileModule],
  controllers: [AppController],
  providers: [AppService, GeminiService],
})
export class AppModule {}
