CREATE TABLE "provider_country_payment_methods" (
	"id" uuid PRIMARY KEY NOT NULL,
	"provider_country_id" uuid NOT NULL,
	"payment_method_id" uuid NOT NULL,
	"min_limit" numeric(20, 2),
	"max_limit" numeric(20, 2),
	"config" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "provider_country_payment_methods_unique" ON "provider_country_payment_methods" USING btree ("provider_country_id","payment_method_id");