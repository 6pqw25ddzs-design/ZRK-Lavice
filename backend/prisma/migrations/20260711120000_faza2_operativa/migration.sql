-- Faza 2: dostupnost za termine + objave ekipa sa evidencijom čitanja

CREATE TYPE "AvailabilityStatus" AS ENUM ('yes', 'no', 'maybe');

CREATE TABLE "availability" (
    "id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "player_id" TEXT NOT NULL,
    "status" "AvailabilityStatus" NOT NULL,
    "reason" TEXT,
    "responded_by_id" TEXT NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "availability_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "availability_event_id_player_id_key" ON "availability"("event_id", "player_id");
ALTER TABLE "availability" ADD CONSTRAINT "availability_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "schedule_events"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "availability" ADD CONSTRAINT "availability_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "players"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "availability" ADD CONSTRAINT "availability_responded_by_id_fkey" FOREIGN KEY ("responded_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "announcements" (
    "id" TEXT NOT NULL,
    "team_id" TEXT NOT NULL,
    "author_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "requires_ack" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "announcements_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "announcements" ADD CONSTRAINT "announcements_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "announcements" ADD CONSTRAINT "announcements_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "announcement_reads" (
    "id" TEXT NOT NULL,
    "announcement_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "read_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "announcement_reads_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "announcement_reads_announcement_id_user_id_key" ON "announcement_reads"("announcement_id", "user_id");
ALTER TABLE "announcement_reads" ADD CONSTRAINT "announcement_reads_announcement_id_fkey" FOREIGN KEY ("announcement_id") REFERENCES "announcements"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "announcement_reads" ADD CONSTRAINT "announcement_reads_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
