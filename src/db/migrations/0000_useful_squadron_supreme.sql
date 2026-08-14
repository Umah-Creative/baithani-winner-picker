CREATE TABLE "event_settings" (
	"id" integer PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"accent_color" text DEFAULT '#d076b4' NOT NULL,
	"logo_bytes" "bytea",
	"logo_mime" text,
	"logo_alt" text,
	"min_range" integer DEFAULT 1 NOT NULL,
	"max_range" integer DEFAULT 1000 NOT NULL,
	"excluded_numbers" integer[] DEFAULT '{}' NOT NULL,
	"og_image_url" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
