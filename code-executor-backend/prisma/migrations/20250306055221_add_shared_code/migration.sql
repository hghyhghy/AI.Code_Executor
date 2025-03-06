-- CreateTable
CREATE TABLE `SharedCode` (
    `id` VARCHAR(191) NOT NULL,
    `userId` INTEGER NOT NULL,
    `code` LONGTEXT NOT NULL,
    `language` VARCHAR(191) NOT NULL,
    `output` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `SharedCode` ADD CONSTRAINT `SharedCode_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
