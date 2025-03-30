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
import { ExecutionHistoryModule } from './execution-history/execution-history.module';
import { CommentModule } from './comment/comment.module';
import { PublichistoryModule } from './publichistory/publichistory.module';
import { UserProfileModule } from './user-profile/user-profile.module';
import { ApiTokenModule } from './api-token/api-token.module';
import { SubscriptionModule } from './subscription/subscription.module';
import { GithubModule } from './github/github.module';
import { InterviewGeminiService } from './interview-gemini/interview-gemini.service';
import { InterviewModule } from './interview/interview.module';
import { ExamModule } from './exam/exam.module';
import { ExamGeminiModule } from './exam-gemini/exam-gemini.module';
import { StudentExamModule } from './student-exam/student-exam.module';

@Module({
  imports: [AuthModule, ExecuteModule, FolderModule, FileModule, ShareModule, CollaborationModule, ExecutionHistoryModule, CommentModule, PublichistoryModule, UserProfileModule, ApiTokenModule, SubscriptionModule, GithubModule, InterviewModule, ExamModule, ExamGeminiModule, StudentExamModule],
  controllers: [AppController],
  providers: [AppService, GeminiService, CollaborationGateway, CollaborationService,PrismaService, InterviewGeminiService],
})
export class AppModule {}
