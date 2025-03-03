import { Module } from '@nestjs/common';
import { FileController } from './file.controller';
import { FileService } from './file.service';
import { PrismaService } from 'src/prisma.service';

@Module({
  controllers: [FileController],
  providers: [FileService, PrismaService]
})
export class FileModule {}
