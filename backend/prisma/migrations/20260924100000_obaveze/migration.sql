-- CreateEnum
CREATE TYPE "PayableStatus" AS ENUM ('unpaid', 'paid');

-- CreateTable
CREATE TABLE "payables" (
    "id" TEXT NOT NULL,
    "vendor" TEXT NOT NULL,
    "description" TEXT,
    "amount_eur" DOUBLE PRECISION NOT NULL,
    "invoice_no" TEXT,
    "invoice_date" TIMESTAMP(3) NOT NULL,
    "due_date" TIMESTAMP(3),
    "status" "PayableStatus" NOT NULL DEFAULT 'unpaid',
    "paid_at" TIMESTAMP(3),
    "created_by_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payables_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "payables" ADD CONSTRAINT "payables_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
