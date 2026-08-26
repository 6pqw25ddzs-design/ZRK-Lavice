-- Finansijska evidencija (prihodi/rashodi)

CREATE TYPE "FinanceKind" AS ENUM ('income', 'expense');

CREATE TABLE "finance_entries" (
    "id" TEXT NOT NULL,
    "kind" "FinanceKind" NOT NULL,
    "category" TEXT NOT NULL,
    "amount_eur" DOUBLE PRECISION NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "description" TEXT,
    "receipt_url" TEXT,
    "created_by_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "finance_entries_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "finance_entries" ADD CONSTRAINT "finance_entries_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
