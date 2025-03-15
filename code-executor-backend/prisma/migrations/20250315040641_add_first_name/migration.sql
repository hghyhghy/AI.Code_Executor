-- DropIndex
DROP INDEX `Userprofile_email_key` ON `userprofile`;

-- AlterTable
ALTER TABLE `userprofile` MODIFY `email` VARCHAR(191) NULL;
