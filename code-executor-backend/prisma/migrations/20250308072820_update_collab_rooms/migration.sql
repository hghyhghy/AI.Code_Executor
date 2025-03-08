/*
  Warnings:

  - You are about to drop the column `userId` on the `userroom` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[name,userId]` on the table `Folder` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[socketId,roomId]` on the table `UserRoom` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `socketId` to the `UserRoom` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `executionhistory` DROP FOREIGN KEY `ExecutionHistory_userId_fkey`;

-- DropForeignKey
ALTER TABLE `userroom` DROP FOREIGN KEY `UserRoom_userId_fkey`;

-- DropIndex
DROP INDEX `ExecutionHistory_userId_fkey` ON `executionhistory`;

-- DropIndex
DROP INDEX `Folder_name_key` ON `folder`;

-- DropIndex
DROP INDEX `UserRoom_userId_roomId_key` ON `userroom`;

-- AlterTable
ALTER TABLE `userroom` DROP COLUMN `userId`,
    ADD COLUMN `socketId` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Folder_name_userId_key` ON `Folder`(`name`, `userId`);

-- CreateIndex
CREATE UNIQUE INDEX `UserRoom_socketId_roomId_key` ON `UserRoom`(`socketId`, `roomId`);

-- AddForeignKey
ALTER TABLE `ExecutionHistory` ADD CONSTRAINT `ExecutionHistory_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
