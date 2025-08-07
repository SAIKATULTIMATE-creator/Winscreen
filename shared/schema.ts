import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const rooms = pgTable("rooms", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  code: varchar("code", { length: 6 }).notNull().unique(),
  hostId: varchar("host_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  isActive: text("is_active").default("true"),
});

export const participants = pgTable("participants", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  roomId: varchar("room_id").references(() => rooms.id),
  deviceId: varchar("device_id").notNull(),
  role: varchar("role", { enum: ["host", "viewer"] }).notNull(),
  isConnected: text("is_connected").default("true"),
  joinedAt: timestamp("joined_at").defaultNow(),
});

export const insertRoomSchema = createInsertSchema(rooms).pick({
  code: true,
  hostId: true,
});

export const insertParticipantSchema = createInsertSchema(participants).pick({
  roomId: true,
  deviceId: true,
  role: true,
});

export type InsertRoom = z.infer<typeof insertRoomSchema>;
export type Room = typeof rooms.$inferSelect;
export type InsertParticipant = z.infer<typeof insertParticipantSchema>;
export type Participant = typeof participants.$inferSelect;
