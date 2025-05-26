import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const weddings = pgTable("weddings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  uniqueUrl: text("unique_url").notNull().unique(),
  bride: text("bride").notNull(),
  groom: text("groom").notNull(),
  weddingDate: timestamp("wedding_date").notNull(),
  venue: text("venue").notNull(),
  venueAddress: text("venue_address").notNull(),
  venueCoordinates: jsonb("venue_coordinates").$type<{ lat: number; lng: number }>(),
  story: text("story"),
  template: text("template").notNull().default("garden-romance"),
  primaryColor: text("primary_color").notNull().default("#D4B08C"),
  accentColor: text("accent_color").notNull().default("#89916B"),
  backgroundMusicUrl: text("background_music_url"),
  isPublic: boolean("is_public").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const guests = pgTable("guests", {
  id: serial("id").primaryKey(),
  weddingId: integer("wedding_id").references(() => weddings.id).notNull(),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  rsvpStatus: text("rsvp_status").$type<"pending" | "confirmed" | "declined" | "maybe">().notNull().default("pending"),
  plusOne: boolean("plus_one").notNull().default(false),
  message: text("message"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  respondedAt: timestamp("responded_at"),
});

export const photos = pgTable("photos", {
  id: serial("id").primaryKey(),
  weddingId: integer("wedding_id").references(() => weddings.id).notNull(),
  url: text("url").notNull(),
  caption: text("caption"),
  isHero: boolean("is_hero").notNull().default(false),
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
});

export const guestBookEntries = pgTable("guest_book_entries", {
  id: serial("id").primaryKey(),
  weddingId: integer("wedding_id").references(() => weddings.id).notNull(),
  guestName: text("guest_name").notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertWeddingSchema = createInsertSchema(weddings).omit({
  id: true,
  userId: true,
  uniqueUrl: true,
  createdAt: true,
});

export const insertGuestSchema = createInsertSchema(guests).omit({
  id: true,
  createdAt: true,
  respondedAt: true,
});

export const insertPhotoSchema = createInsertSchema(photos).omit({
  id: true,
  uploadedAt: true,
});

export const insertGuestBookEntrySchema = createInsertSchema(guestBookEntries).omit({
  id: true,
  createdAt: true,
});

export const rsvpUpdateSchema = z.object({
  rsvpStatus: z.enum(["confirmed", "declined", "maybe"]),
  message: z.string().optional(),
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Wedding = typeof weddings.$inferSelect;
export type InsertWedding = z.infer<typeof insertWeddingSchema>;

export type Guest = typeof guests.$inferSelect;
export type InsertGuest = z.infer<typeof insertGuestSchema>;

export type Photo = typeof photos.$inferSelect;
export type InsertPhoto = z.infer<typeof insertPhotoSchema>;

export type GuestBookEntry = typeof guestBookEntries.$inferSelect;
export type InsertGuestBookEntry = z.infer<typeof insertGuestBookEntrySchema>;

export type RSVPUpdate = z.infer<typeof rsvpUpdateSchema>;
