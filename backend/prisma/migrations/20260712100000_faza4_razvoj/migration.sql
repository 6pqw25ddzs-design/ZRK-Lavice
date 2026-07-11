-- Faza 4: kriterijumi, evaluacije, ciljevi, prekretnice, povrede

CREATE TYPE "EvalDomain" AS ENUM ('technical', 'tactical', 'physical', 'mental', 'goalkeeper');
CREATE TYPE "GoalStatus" AS ENUM ('active', 'done', 'paused');
CREATE TYPE "InjuryStatus" AS ENUM ('ready', 'caution', 'out');

CREATE TABLE "criteria" (
    "id" TEXT NOT NULL,
    "domain" "EvalDomain" NOT NULL,
    "name" TEXT NOT NULL,
    "category" "TeamCategory",
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "criteria_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "evaluations" (
    "id" TEXT NOT NULL,
    "player_id" TEXT NOT NULL,
    "coach_user_id" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "comment" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "evaluations_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "evaluations" ADD CONSTRAINT "evaluations_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "players"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "evaluations" ADD CONSTRAINT "evaluations_coach_user_id_fkey" FOREIGN KEY ("coach_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "evaluation_scores" (
    "id" TEXT NOT NULL,
    "evaluation_id" TEXT NOT NULL,
    "criterion_id" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    CONSTRAINT "evaluation_scores_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "evaluation_scores_evaluation_id_criterion_id_key" ON "evaluation_scores"("evaluation_id", "criterion_id");
ALTER TABLE "evaluation_scores" ADD CONSTRAINT "evaluation_scores_evaluation_id_fkey" FOREIGN KEY ("evaluation_id") REFERENCES "evaluations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "evaluation_scores" ADD CONSTRAINT "evaluation_scores_criterion_id_fkey" FOREIGN KEY ("criterion_id") REFERENCES "criteria"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "development_goals" (
    "id" TEXT NOT NULL,
    "player_id" TEXT NOT NULL,
    "coach_user_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "GoalStatus" NOT NULL DEFAULT 'active',
    "due_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "done_at" TIMESTAMP(3),
    CONSTRAINT "development_goals_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "development_goals" ADD CONSTRAINT "development_goals_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "players"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "development_goals" ADD CONSTRAINT "development_goals_coach_user_id_fkey" FOREIGN KEY ("coach_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "milestones" (
    "id" TEXT NOT NULL,
    "player_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "kind" TEXT NOT NULL DEFAULT 'manual',
    "badge" TEXT,
    "achieved_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "milestones_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "milestones" ADD CONSTRAINT "milestones_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "players"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "injury_records" (
    "id" TEXT NOT NULL,
    "player_id" TEXT NOT NULL,
    "status" "InjuryStatus" NOT NULL,
    "note" TEXT,
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "returned_at" TIMESTAMP(3),
    CONSTRAINT "injury_records_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "injury_records" ADD CONSTRAINT "injury_records_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "players"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Početni šifarnik kriterijuma (važe za sve kategorije)
INSERT INTO "criteria" ("id", "domain", "name", "sort_order") VALUES
  (gen_random_uuid()::text, 'technical', 'Hvatanje i dodavanje', 1),
  (gen_random_uuid()::text, 'technical', 'Šut', 2),
  (gen_random_uuid()::text, 'technical', 'Driblanje i vođenje lopte', 3),
  (gen_random_uuid()::text, 'technical', 'Kretanje bez lopte', 4),
  (gen_random_uuid()::text, 'tactical', 'Razumijevanje igre', 10),
  (gen_random_uuid()::text, 'tactical', 'Igra u odbrani', 11),
  (gen_random_uuid()::text, 'tactical', 'Igra u napadu', 12),
  (gen_random_uuid()::text, 'tactical', 'Pozicioniranje', 13),
  (gen_random_uuid()::text, 'physical', 'Brzina', 20),
  (gen_random_uuid()::text, 'physical', 'Agilnost', 21),
  (gen_random_uuid()::text, 'physical', 'Izdržljivost', 22),
  (gen_random_uuid()::text, 'physical', 'Koordinacija', 23),
  (gen_random_uuid()::text, 'mental', 'Trud i zalaganje', 30),
  (gen_random_uuid()::text, 'mental', 'Koncentracija', 31),
  (gen_random_uuid()::text, 'mental', 'Timski duh', 32),
  (gen_random_uuid()::text, 'mental', 'Dolaznost', 33),
  (gen_random_uuid()::text, 'goalkeeper', 'Osnovni stav i tehnika', 40),
  (gen_random_uuid()::text, 'goalkeeper', 'Odbrana šuteva', 41),
  (gen_random_uuid()::text, 'goalkeeper', 'Izlasci i suženje ugla', 42),
  (gen_random_uuid()::text, 'goalkeeper', 'Otvaranje kontranapada', 43);
