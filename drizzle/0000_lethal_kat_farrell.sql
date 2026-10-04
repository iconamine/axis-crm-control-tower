CREATE TABLE `activities` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`work_item_id` integer,
	`action` text NOT NULL,
	`actor` text NOT NULL,
	`detail` text DEFAULT '' NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`work_item_id`) REFERENCES `work_items`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `activities_work_item_idx` ON `activities` (`work_item_id`);--> statement-breakpoint
CREATE TABLE `release_gates` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`target_date` text NOT NULL,
	`status` text NOT NULL,
	`readiness_score` integer DEFAULT 0 NOT NULL,
	`blockers` integer DEFAULT 0 NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `release_gates_name_unique` ON `release_gates` (`name`);--> statement-breakpoint
CREATE TABLE `work_items` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`key` text NOT NULL,
	`title` text NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`type` text NOT NULL,
	`status` text NOT NULL,
	`severity` text NOT NULL,
	`priority_score` integer DEFAULT 50 NOT NULL,
	`sla_due_at` text,
	`owner` text DEFAULT 'Unassigned' NOT NULL,
	`source` text DEFAULT 'CRM' NOT NULL,
	`business_impact` text DEFAULT '' NOT NULL,
	`user_story` text DEFAULT '' NOT NULL,
	`acceptance_criteria` text DEFAULT '' NOT NULL,
	`test_status` text DEFAULT 'Not started' NOT NULL,
	`release_name` text DEFAULT 'Backlog' NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `work_items_key_unique` ON `work_items` (`key`);--> statement-breakpoint
CREATE INDEX `work_items_status_idx` ON `work_items` (`status`);--> statement-breakpoint
CREATE INDEX `work_items_status_priority_idx` ON `work_items` (`status`,`priority_score`);--> statement-breakpoint
CREATE INDEX `work_items_type_idx` ON `work_items` (`type`);