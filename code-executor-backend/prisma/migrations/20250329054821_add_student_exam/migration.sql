-- CreateTable
CREATE TABLE `StudentExam` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `assignedBy` INTEGER NOT NULL,
    `topic` VARCHAR(191) NOT NULL,
    `questions` JSON NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'pending',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `StudentExamAnswer` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `studentExamId` INTEGER NOT NULL,
    `userId` INTEGER NOT NULL,
    `answers` JSON NOT NULL,
    `score` INTEGER NULL,
    `evaluated` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `StudentExam` ADD CONSTRAINT `StudentExam_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StudentExam` ADD CONSTRAINT `StudentExam_assignedBy_fkey` FOREIGN KEY (`assignedBy`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StudentExamAnswer` ADD CONSTRAINT `StudentExamAnswer_studentExamId_fkey` FOREIGN KEY (`studentExamId`) REFERENCES `StudentExam`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StudentExamAnswer` ADD CONSTRAINT `StudentExamAnswer_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
