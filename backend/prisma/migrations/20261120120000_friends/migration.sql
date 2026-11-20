-- Zid donatora „Prijatelji kluba"
CREATE TABLE IF NOT EXISTS "friends" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "kind" TEXT NOT NULL DEFAULT 'individual',
    "amount_eur" DOUBLE PRECISION,
    "logo_url" TEXT,
    "website_url" TEXT,
    "note" TEXT,
    "visible" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "friends_pkey" PRIMARY KEY ("id")
);
