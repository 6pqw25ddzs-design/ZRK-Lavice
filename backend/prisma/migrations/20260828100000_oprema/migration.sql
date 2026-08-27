-- Evidencija opreme: zaduženja po igračici (ili klupska oprema bez igračice)

CREATE TABLE "equipment_items" (
    "id" TEXT NOT NULL,
    "player_id" TEXT,
    "item_type" TEXT NOT NULL,
    "label" TEXT,
    "size" TEXT,
    "issued_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "returned_at" TIMESTAMP(3),
    "note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "equipment_items_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "equipment_items" ADD CONSTRAINT "equipment_items_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "players"("id") ON DELETE SET NULL ON UPDATE CASCADE;
