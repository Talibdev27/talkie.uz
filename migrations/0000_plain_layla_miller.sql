CREATE TABLE "budget_categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"wedding_id" integer NOT NULL,
	"name" text NOT NULL,
	"estimated_cost" integer NOT NULL,
	"actual_cost" integer DEFAULT 0 NOT NULL,
	"is_paid" boolean DEFAULT false NOT NULL,
	"priority" text DEFAULT 'medium' NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "budget_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"category_id" integer NOT NULL,
	"name" text NOT NULL,
	"estimated_cost" integer NOT NULL,
	"actual_cost" integer DEFAULT 0 NOT NULL,
	"is_paid" boolean DEFAULT false NOT NULL,
	"vendor" text,
	"due_date" timestamp,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "guest_book_entries" (
	"id" serial PRIMARY KEY NOT NULL,
	"wedding_id" integer NOT NULL,
	"guest_name" text NOT NULL,
	"message" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "guest_collaborators" (
	"id" serial PRIMARY KEY NOT NULL,
	"wedding_id" integer NOT NULL,
	"email" text NOT NULL,
	"name" text NOT NULL,
	"role" text DEFAULT 'editor' NOT NULL,
	"invited_at" timestamp DEFAULT now() NOT NULL,
	"accepted_at" timestamp,
	"last_active_at" timestamp,
	"status" text DEFAULT 'pending' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "guests" (
	"id" serial PRIMARY KEY NOT NULL,
	"wedding_id" integer NOT NULL,
	"name" text NOT NULL,
	"email" text,
	"phone" text,
	"rsvp_status" text DEFAULT 'pending' NOT NULL,
	"plus_one" boolean DEFAULT false NOT NULL,
	"plus_one_name" text,
	"additional_guests" integer DEFAULT 0 NOT NULL,
	"message" text,
	"category" text DEFAULT 'family' NOT NULL,
	"side" text DEFAULT 'both' NOT NULL,
	"dietary_restrictions" text,
	"address" text,
	"invitation_sent" boolean DEFAULT false NOT NULL,
	"invitation_sent_at" timestamp,
	"added_by" text DEFAULT 'couple' NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"responded_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "invitations" (
	"id" serial PRIMARY KEY NOT NULL,
	"guest_id" integer NOT NULL,
	"wedding_id" integer NOT NULL,
	"invitation_type" text DEFAULT 'email' NOT NULL,
	"invitation_template" text DEFAULT 'classic' NOT NULL,
	"sent_at" timestamp,
	"delivered_at" timestamp,
	"opened_at" timestamp,
	"status" text DEFAULT 'pending' NOT NULL,
	"error_message" text,
	"reminder_sent_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "milestones" (
	"id" serial PRIMARY KEY NOT NULL,
	"wedding_id" integer NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"target_date" timestamp NOT NULL,
	"is_completed" boolean DEFAULT false NOT NULL,
	"completed_at" timestamp,
	"celebration_message" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "photos" (
	"id" serial PRIMARY KEY NOT NULL,
	"wedding_id" integer NOT NULL,
	"url" text NOT NULL,
	"caption" text,
	"is_hero" boolean DEFAULT false NOT NULL,
	"photo_type" text DEFAULT 'memory' NOT NULL,
	"uploaded_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"password" text NOT NULL,
	"name" text NOT NULL,
	"is_admin" boolean DEFAULT false NOT NULL,
	"role" text DEFAULT 'user' NOT NULL,
	"has_paid_subscription" boolean DEFAULT false NOT NULL,
	"payment_method" text,
	"payment_order_id" text,
	"payment_date" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "wedding_access" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"wedding_id" integer NOT NULL,
	"access_level" text DEFAULT 'viewer' NOT NULL,
	"permissions" jsonb DEFAULT '{"canEditDetails":false,"canManageGuests":false,"canViewAnalytics":false,"canManagePhotos":false,"canEditGuestBook":false}'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "weddings" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"unique_url" text NOT NULL,
	"bride" text NOT NULL,
	"groom" text NOT NULL,
	"wedding_date" timestamp NOT NULL,
	"wedding_time" text DEFAULT '4:00 PM' NOT NULL,
	"timezone" text DEFAULT 'Asia/Tashkent' NOT NULL,
	"venue" text NOT NULL,
	"venue_address" text NOT NULL,
	"venue_coordinates" jsonb,
	"map_pin_url" text,
	"story" text,
	"welcome_message" text,
	"dear_guest_message" text,
	"couple_photo_url" text,
	"background_template" text DEFAULT 'template1',
	"template" text DEFAULT 'garden-romance' NOT NULL,
	"primary_color" text DEFAULT '#D4B08C' NOT NULL,
	"accent_color" text DEFAULT '#89916B' NOT NULL,
	"background_music_url" text,
	"is_public" boolean DEFAULT true NOT NULL,
	"available_languages" text[] DEFAULT '{"en"}' NOT NULL,
	"default_language" text DEFAULT 'en' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "weddings_unique_url_unique" UNIQUE("unique_url")
);
--> statement-breakpoint
ALTER TABLE "budget_categories" ADD CONSTRAINT "budget_categories_wedding_id_weddings_id_fk" FOREIGN KEY ("wedding_id") REFERENCES "public"."weddings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "budget_items" ADD CONSTRAINT "budget_items_category_id_budget_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."budget_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "guest_book_entries" ADD CONSTRAINT "guest_book_entries_wedding_id_weddings_id_fk" FOREIGN KEY ("wedding_id") REFERENCES "public"."weddings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "guest_collaborators" ADD CONSTRAINT "guest_collaborators_wedding_id_weddings_id_fk" FOREIGN KEY ("wedding_id") REFERENCES "public"."weddings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "guests" ADD CONSTRAINT "guests_wedding_id_weddings_id_fk" FOREIGN KEY ("wedding_id") REFERENCES "public"."weddings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_guest_id_guests_id_fk" FOREIGN KEY ("guest_id") REFERENCES "public"."guests"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_wedding_id_weddings_id_fk" FOREIGN KEY ("wedding_id") REFERENCES "public"."weddings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "milestones" ADD CONSTRAINT "milestones_wedding_id_weddings_id_fk" FOREIGN KEY ("wedding_id") REFERENCES "public"."weddings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "photos" ADD CONSTRAINT "photos_wedding_id_weddings_id_fk" FOREIGN KEY ("wedding_id") REFERENCES "public"."weddings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wedding_access" ADD CONSTRAINT "wedding_access_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wedding_access" ADD CONSTRAINT "wedding_access_wedding_id_weddings_id_fk" FOREIGN KEY ("wedding_id") REFERENCES "public"."weddings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "weddings" ADD CONSTRAINT "weddings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;