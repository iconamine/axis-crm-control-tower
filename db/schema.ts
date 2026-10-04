// Intentionally empty by default.
// Add Drizzle tables here when the site actually needs a database.
// See examples/d1/db/schema.ts for an opt-in example.
export {};
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const workItems = sqliteTable(
  "work_items",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    key: text("key").notNull().unique(),
    title: text("title").notNull(),
    description: text("description").notNull().default(""),
    type: text("type").notNull(),
    status: text("status").notNull(),
    severity: text("severity").notNull(),
    priorityScore: integer("priority_score").notNull().default(50),
    slaDueAt: text("sla_due_at"),
    owner: text("owner").notNull().default("Unassigned"),
    source: text("source").notNull().default("CRM"),
    businessImpact: text("business_impact").notNull().default(""),
    userStory: text("user_story").notNull().default(""),
    acceptanceCriteria: text("acceptance_criteria").notNull().default(""),
    testStatus: text("test_status").notNull().default("Not started"),
    releaseName: text("release_name").notNull().default("Backlog"),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (table) => [
    index("work_items_status_idx").on(table.status),
    index("work_items_status_priority_idx").on(table.status, table.priorityScore),
    index("work_items_type_idx").on(table.type),
  ],
);

export const activities = sqliteTable(
  "activities",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    workItemId: integer("work_item_id").references(() => workItems.id),
    action: text("action").notNull(),
    actor: text("actor").notNull(),
    detail: text("detail").notNull().default(""),
    createdAt: text("created_at").notNull(),
  },
  (table) => [index("activities_work_item_idx").on(table.workItemId)],
);

export const releaseGates = sqliteTable("release_gates", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull().unique(),
  targetDate: text("target_date").notNull(),
  status: text("status").notNull(),
  readinessScore: integer("readiness_score").notNull().default(0),
  blockers: integer("blockers").notNull().default(0),
  updatedAt: text("updated_at").notNull(),
});
