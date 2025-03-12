/*
  Warnings:

  - You are about to drop the column `codeId` on the `comment` table. All the data in the column will be lost.
  - Added the required column `executionId` to the `Comment` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `comment` DROP FOREIGN KEY `Comment_codeId_fkey`;

-- DropIndex
DROP INDEX `Comment_codeId_fkey` ON `comment`;

-- AlterTable
ALTER TABLE `comment` DROP COLUMN `codeId`,
    ADD COLUMN `executionId` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `Comment` ADD CONSTRAINT `Comment_executionId_fkey` FOREIGN KEY (`executionId`) REFERENCES `ExecutionHistory`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
