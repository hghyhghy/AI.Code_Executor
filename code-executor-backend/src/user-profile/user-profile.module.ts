import { Module } from '@nestjs/common';
import { UserProfileService } from './user-profile.service';
import { UserProfileController } from './user-profile.controller';
import { PrismaService } from 'src/prisma.service';

@Module({
  providers: [UserProfileService,  PrismaService],
  controllers: [UserProfileController]
})
export class UserProfileModule {}
