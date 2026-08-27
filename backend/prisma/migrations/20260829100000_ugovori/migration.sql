-- Ugovori i obaveze sa rokovima isteka (sponzorstva, registracije, osiguranja...)

CREATE TABLE "contracts" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "party" TEXT,
    "kind" TEXT NOT NULL,
    "signed_at" TIMESTAMP(3),
    "expires_at" TIMESTAMP(3) NOT NULL,
    "amount_eur" DOUBLE PRECISION,
    "file_url" TEXT,
    "note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "contracts_pkey" PRIMARY KEY ("id")
);
