-- Faza 3: dokumenti, saglasnosti, članarine, medicinski podaci, probni treninzi

ALTER TYPE "RegistrationStatus" ADD VALUE IF NOT EXISTS 'scheduled';
ALTER TYPE "RegistrationStatus" ADD VALUE IF NOT EXISTS 'attended';
ALTER TYPE "RegistrationStatus" ADD VALUE IF NOT EXISTS 'enrolled';

CREATE TYPE "ConsentType" AS ENUM ('media', 'data', 'travel');
CREATE TYPE "FeeStatus" AS ENUM ('unpaid', 'paid', 'waived');

CREATE TABLE "document_types" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "is_required" BOOLEAN NOT NULL DEFAULT true,
    "valid_months" INTEGER,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "document_types_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "document_types_name_key" ON "document_types"("name");

CREATE TABLE "player_documents" (
    "id" TEXT NOT NULL,
    "player_id" TEXT NOT NULL,
    "type_id" TEXT NOT NULL,
    "file_url" TEXT,
    "issued_at" TIMESTAMP(3) NOT NULL,
    "expires_at" TIMESTAMP(3),
    "note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "player_documents_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "player_documents" ADD CONSTRAINT "player_documents_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "players"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "player_documents" ADD CONSTRAINT "player_documents_type_id_fkey" FOREIGN KEY ("type_id") REFERENCES "document_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "consents" (
    "id" TEXT NOT NULL,
    "player_id" TEXT NOT NULL,
    "type" "ConsentType" NOT NULL,
    "signed_by_id" TEXT NOT NULL,
    "signed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revoked_at" TIMESTAMP(3),
    "version" TEXT NOT NULL DEFAULT 'v1',
    CONSTRAINT "consents_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "consents" ADD CONSTRAINT "consents_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "players"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "consents" ADD CONSTRAINT "consents_signed_by_id_fkey" FOREIGN KEY ("signed_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "membership_fees" (
    "id" TEXT NOT NULL,
    "player_id" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "amount_eur" DOUBLE PRECISION NOT NULL,
    "status" "FeeStatus" NOT NULL DEFAULT 'unpaid',
    "paid_at" TIMESTAMP(3),
    "method" TEXT,
    "note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "membership_fees_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "membership_fees_player_id_year_month_key" ON "membership_fees"("player_id", "year", "month");
ALTER TABLE "membership_fees" ADD CONSTRAINT "membership_fees_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "players"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "medical_info" (
    "id" TEXT NOT NULL,
    "player_id" TEXT NOT NULL,
    "notes" TEXT,
    "coach_note" TEXT,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "medical_info_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "medical_info_player_id_key" ON "medical_info"("player_id");
ALTER TABLE "medical_info" ADD CONSTRAINT "medical_info_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "players"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "emergency_contacts" (
    "id" TEXT NOT NULL,
    "player_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "relation" TEXT,
    CONSTRAINT "emergency_contacts_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "emergency_contacts" ADD CONSTRAINT "emergency_contacts_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "players"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "trial_slots" (
    "id" TEXT NOT NULL,
    "starts_at" TIMESTAMP(3) NOT NULL,
    "category" TEXT,
    "capacity" INTEGER NOT NULL DEFAULT 10,
    "location" TEXT,
    "notes" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "trial_slots_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "registrations" ADD COLUMN "trial_slot_id" TEXT;
ALTER TABLE "registrations" ADD CONSTRAINT "registrations_trial_slot_id_fkey" FOREIGN KEY ("trial_slot_id") REFERENCES "trial_slots"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Početni šifarnik dokumenata
INSERT INTO "document_types" ("id", "name", "is_required", "valid_months", "sort_order") VALUES
  (gen_random_uuid()::text, 'Ljekarski pregled', true, 6, 1),
  (gen_random_uuid()::text, 'Pristupnica klubu', true, NULL, 2),
  (gen_random_uuid()::text, 'Kopija zdravstvene knjižice', false, NULL, 3);
