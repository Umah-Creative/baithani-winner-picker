CREATE TABLE "admin_audit_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"action" text NOT NULL,
	"outcome" text NOT NULL,
	"actor" text NOT NULL,
	"occurred_at" timestamp with time zone DEFAULT now() NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"accept_language" text,
	"request_id" text,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL
);
--> statement-breakpoint
CREATE INDEX "admin_audit_logs_occurred_at_idx" ON "admin_audit_logs" USING btree ("occurred_at");--> statement-breakpoint
CREATE INDEX "admin_audit_logs_action_occurred_at_idx" ON "admin_audit_logs" USING btree ("action","occurred_at");--> statement-breakpoint
CREATE INDEX "admin_audit_logs_request_id_idx" ON "admin_audit_logs" USING btree ("request_id");