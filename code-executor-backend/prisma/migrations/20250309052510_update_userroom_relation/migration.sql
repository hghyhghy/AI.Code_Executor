-- DropForeignKey
ALTER TABLE `userroom` DROP FOREIGN KEY `UserRoom_roomId_fkey`;

-- DropIndex
DROP INDEX `UserRoom_roomId_fkey` ON `userroom`;

-- AlterTable
ALTER TABLE `userroom` MODIFY `roomId` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `UserRoom` ADD CONSTRAINT `UserRoom_roomId_fkey` FOREIGN KEY (`roomId`) REFERENCES `Room`(`roomId`) ON DELETE CASCADE ON UPDATE CASCADE;
