CREATE TABLE `challengePhotos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`challengeId` int NOT NULL,
	`url` text NOT NULL,
	`fileKey` varchar(512),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `challengePhotos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `challenges` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(200) NOT NULL,
	`description` text NOT NULL,
	`location` varchar(255) NOT NULL,
	`reportedBy` int NOT NULL,
	`status` enum('open','in_progress','resolved') NOT NULL DEFAULT 'open',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `challenges_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `partnerships` (
	`id` int AUTO_INCREMENT NOT NULL,
	`proposalId` int NOT NULL,
	`industryId` int NOT NULL,
	`partnershipDetails` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `partnerships_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `proposals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`challengeId` int NOT NULL,
	`universityId` int NOT NULL,
	`proposalText` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `proposals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` varchar(64) NOT NULL,
	`userId` int NOT NULL,
	`expiresAt` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `sessions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('user','admin','citizen','university','industry') NOT NULL DEFAULT 'user';--> statement-breakpoint
ALTER TABLE `users` ADD `organization` varchar(255);--> statement-breakpoint
ALTER TABLE `users` ADD `passwordHash` text;--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_email_unique` UNIQUE(`email`);--> statement-breakpoint
ALTER TABLE `challengePhotos` ADD CONSTRAINT `challengePhotos_challengeId_challenges_id_fk` FOREIGN KEY (`challengeId`) REFERENCES `challenges`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `challenges` ADD CONSTRAINT `challenges_reportedBy_users_id_fk` FOREIGN KEY (`reportedBy`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `partnerships` ADD CONSTRAINT `partnerships_proposalId_proposals_id_fk` FOREIGN KEY (`proposalId`) REFERENCES `proposals`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `partnerships` ADD CONSTRAINT `partnerships_industryId_users_id_fk` FOREIGN KEY (`industryId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `proposals` ADD CONSTRAINT `proposals_challengeId_challenges_id_fk` FOREIGN KEY (`challengeId`) REFERENCES `challenges`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `proposals` ADD CONSTRAINT `proposals_universityId_users_id_fk` FOREIGN KEY (`universityId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `sessions` ADD CONSTRAINT `sessions_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `challenge_photos_challenge_idx` ON `challengePhotos` (`challengeId`);--> statement-breakpoint
CREATE INDEX `challenges_reporter_idx` ON `challenges` (`reportedBy`);--> statement-breakpoint
CREATE INDEX `challenges_created_at_idx` ON `challenges` (`createdAt`);--> statement-breakpoint
CREATE INDEX `challenges_status_idx` ON `challenges` (`status`);--> statement-breakpoint
CREATE INDEX `partnerships_proposal_idx` ON `partnerships` (`proposalId`);--> statement-breakpoint
CREATE INDEX `partnerships_industry_idx` ON `partnerships` (`industryId`);--> statement-breakpoint
CREATE INDEX `partnerships_created_at_idx` ON `partnerships` (`createdAt`);--> statement-breakpoint
CREATE INDEX `proposals_challenge_idx` ON `proposals` (`challengeId`);--> statement-breakpoint
CREATE INDEX `proposals_university_idx` ON `proposals` (`universityId`);--> statement-breakpoint
CREATE INDEX `proposals_created_at_idx` ON `proposals` (`createdAt`);--> statement-breakpoint
CREATE INDEX `sessions_user_idx` ON `sessions` (`userId`);--> statement-breakpoint
CREATE INDEX `sessions_expires_idx` ON `sessions` (`expiresAt`);--> statement-breakpoint
CREATE INDEX `users_role_idx` ON `users` (`role`);