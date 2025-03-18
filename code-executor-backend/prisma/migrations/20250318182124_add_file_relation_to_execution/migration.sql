-- AlterTable
ALTER TABLE `executionhistory` ADD COLUMN `fileId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `ExecutionHistory` ADD CONSTRAINT `ExecutionHistory_fileId_fkey` FOREIGN KEY (`fileId`) REFERENCES `File`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
