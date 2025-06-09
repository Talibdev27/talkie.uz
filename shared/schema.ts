import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  isAdmin: boolean("is_admin").default(false).notNull(),
  role: text("role").$type<"user" | "admin" | "guest_manager">().notNull().default("user"),
  hasPaidSubscription: boolean("has_paid_subscription").default(false).notNull(),
  paymentMethod: text("payment_method"), // 'click', 'payme', or null
  paymentOrderId: text("payment_order_id"),
  paymentDate: timestamp("payment_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const weddings = pgTable("weddings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  uniqueUrl: text("unique_url").notNull().unique(),
  bride: text("bride").notNull(),
  groom: text("groom").notNull(),
  weddingDate: timestamp("wedding_date").notNull(),
  weddingTime: text("wedding_time").notNull().default("4:00 PM"),
  venue: text("venue").notNull(),
  venueAddress: text("venue_address").notNull(),
  venueCoordinates: jsonb("venue_coordinates").$type<{ lat: number; lng: number }>(),
  story: text("story"),
  welcomeMessage: text("welcome_message"),
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
  plusOneName: text("plus_one_name"),
  additionalGuests: integer("additional_guests").notNull().default(0),
  message: text("message"),
  category: text("category").notNull().default("family"), // family, friends, colleagues, etc.
  side: text("side").$type<"bride" | "groom" | "both">().notNull().default("both"),
  dietaryRestrictions: text("dietary_restrictions"),
  address: text("address"),
  invitationSent: boolean("invitation_sent").notNull().default(false),
  invitationSentAt: timestamp("invitation_sent_at"),
  addedBy: text("added_by").notNull().default("couple"), // couple, family, friend
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  respondedAt: timestamp("responded_at"),
});

export const photos = pgTable("photos", {
  id: serial("id").primaryKey(),
  weddingId: integer("wedding_id").references(() => weddings.id).notNull(),
  url: text("url").notNull(),
  caption: text("caption"),
  isHero: boolean("is_hero").notNull().default(false),
  photoType: text("photo_type").$type<"couple" | "memory" | "hero">().notNull().default("memory"),
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
});

export const guestBookEntries = pgTable("guest_book_entries", {
  id: serial("id").primaryKey(),
  weddingId: integer("wedding_id").references(() => weddings.id).notNull(),
  guestName: text("guest_name").notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const budgetCategories = pgTable("budget_categories", {
  id: serial("id").primaryKey(),
  weddingId: integer("wedding_id").references(() => weddings.id).notNull(),
  name: text("name").notNull(),
  estimatedCost: integer("estimated_cost").notNull(),
  actualCost: integer("actual_cost").notNull().default(0),
  isPaid: boolean("is_paid").notNull().default(false),
  priority: text("priority").notNull().default("medium"), // high, medium, low
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const budgetItems = pgTable("budget_items", {
  id: serial("id").primaryKey(),
  categoryId: integer("category_id").references(() => budgetCategories.id).notNull(),
  name: text("name").notNull(),
  estimatedCost: integer("estimated_cost").notNull(),
  actualCost: integer("actual_cost").notNull().default(0),
  isPaid: boolean("is_paid").notNull().default(false),
  vendor: text("vendor"),
  dueDate: timestamp("due_date"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const milestones = pgTable("milestones", {
  id: serial("id").primaryKey(),
  weddingId: integer("wedding_id").references(() => weddings.id).notNull(),
  title: text("title").notNull(),
  description: text("description"),
  targetDate: timestamp("target_date").notNull(),
  isCompleted: boolean("is_completed").notNull().default(false),
  completedAt: timestamp("completed_at"),
  celebrationMessage: text("celebration_message"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const invitations = pgTable("invitations", {
  id: serial("id").primaryKey(),
  guestId: integer("guest_id").references(() => guests.id).notNull(),
  weddingId: integer("wedding_id").references(() => weddings.id).notNull(),
  invitationType: text("invitation_type").notNull().default("email"), // email, sms, whatsapp
  invitationTemplate: text("invitation_template").notNull().default("classic"),
  sentAt: timestamp("sent_at"),
  deliveredAt: timestamp("delivered_at"),
  openedAt: timestamp("opened_at"),
  status: text("status").notNull().default("pending"), // pending, sent, delivered, opened, failed
  errorMessage: text("error_message"),
  reminderSentAt: timestamp("reminder_sent_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const guestCollaborators = pgTable("guest_collaborators", {
  id: serial("id").primaryKey(),
  weddingId: integer("wedding_id").references(() => weddings.id).notNull(),
  email: text("email").notNull(),
  name: text("name").notNull(),
  role: text("role").notNull().default("editor"), // viewer, editor, admin
  invitedAt: timestamp("invited_at").defaultNow().notNull(),
  acceptedAt: timestamp("accepted_at"),
  lastActiveAt: timestamp("last_active_at"),
  status: text("status").notNull().default("pending"), // pending, active, inactive
});

export const weddingAccess = pgTable("wedding_access", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  weddingId: integer("wedding_id").references(() => weddings.id).notNull(),
  accessLevel: text("access_level").$type<"owner" | "guest_manager" | "viewer">().notNull().default("viewer"),
  permissions: jsonb("permissions").$type<{
    canEditDetails: boolean;
    canManageGuests: boolean;
    canViewAnalytics: boolean;
    canManagePhotos: boolean;
    canEditGuestBook: boolean;
  }>().notNull().default({
    canEditDetails: false,
    canManageGuests: false,
    canViewAnalytics: false,
    canManagePhotos: false,
    canEditGuestBook: false
  }),
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

export const insertBudgetCategorySchema = createInsertSchema(budgetCategories).omit({
  id: true,
  createdAt: true,
});

export const insertBudgetItemSchema = createInsertSchema(budgetItems).omit({
  id: true,
  createdAt: true,
});

export const insertMilestoneSchema = createInsertSchema(milestones).omit({
  id: true,
  createdAt: true,
  completedAt: true,
});

export const insertInvitationSchema = createInsertSchema(invitations).omit({
  id: true,
  createdAt: true,
});

export const insertGuestCollaboratorSchema = createInsertSchema(guestCollaborators).omit({
  id: true,
  invitedAt: true,
});

export const insertWeddingAccessSchema = createInsertSchema(weddingAccess).omit({
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

export type BudgetCategory = typeof budgetCategories.$inferSelect;
export type InsertBudgetCategory = z.infer<typeof insertBudgetCategorySchema>;

export type BudgetItem = typeof budgetItems.$inferSelect;
export type InsertBudgetItem = z.infer<typeof insertBudgetItemSchema>;

export type Milestone = typeof milestones.$inferSelect;
export type InsertMilestone = z.infer<typeof insertMilestoneSchema>;

export type Invitation = typeof invitations.$inferSelect;
export type InsertInvitation = z.infer<typeof insertInvitationSchema>;

export type GuestCollaborator = typeof guestCollaborators.$inferSelect;
export type InsertGuestCollaborator = z.infer<typeof insertGuestCollaboratorSchema>;

export type WeddingAccess = typeof weddingAccess.$inferSelect;
export type InsertWeddingAccess = z.infer<typeof insertWeddingAccessSchema>;

export type RSVPUpdate = z.infer<typeof rsvpUpdateSchema>;
