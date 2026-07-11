-- Faza 1: sezone, istorija ekipa, veza roditelj-dijete, pozivni kodovi, push tokeni

CREATE TABLE "seasons" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "starts_at" TIMESTAMP(3) NOT NULL,
    "ends_at" TIMESTAMP(3) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "seasons_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "seasons_name_key" ON "seasons"("name");

CREATE TABLE "team_assignments" (
    "id" TEXT NOT NULL,
    "player_id" TEXT NOT NULL,
    "team_id" TEXT NOT NULL,
    "season_id" TEXT NOT NULL,
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ended_at" TIMESTAMP(3),
    "end_reason" TEXT,
    CONSTRAINT "team_assignments_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "team_assignments_player_id_team_id_season_id_key" ON "team_assignments"("player_id", "team_id", "season_id");
ALTER TABLE "team_assignments" ADD CONSTRAINT "team_assignments_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "players"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "team_assignments" ADD CONSTRAINT "team_assignments_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "team_assignments" ADD CONSTRAINT "team_assignments_season_id_fkey" FOREIGN KEY ("season_id") REFERENCES "seasons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "parent_links" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "player_id" TEXT NOT NULL,
    "relation" TEXT,
    "is_primary" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "parent_links_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "parent_links_user_id_player_id_key" ON "parent_links"("user_id", "player_id");
ALTER TABLE "parent_links" ADD CONSTRAINT "parent_links_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "parent_links" ADD CONSTRAINT "parent_links_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "players"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "invite_codes" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "player_id" TEXT NOT NULL,
    "used_by_user_id" TEXT,
    "used_at" TIMESTAMP(3),
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "invite_codes_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "invite_codes_code_key" ON "invite_codes"("code");
ALTER TABLE "invite_codes" ADD CONSTRAINT "invite_codes_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "players"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "invite_codes" ADD CONSTRAINT "invite_codes_used_by_user_id_fkey" FOREIGN KEY ("used_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "push_tokens" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "platform" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "push_tokens_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "push_tokens_token_key" ON "push_tokens"("token");
ALTER TABLE "push_tokens" ADD CONSTRAINT "push_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Backfill: aktivna sezona 2026/27 + postojeće igračice u svoje ekipe
INSERT INTO "seasons" ("id", "name", "starts_at", "ends_at", "is_active")
VALUES (gen_random_uuid()::text, '2026/27', '2026-08-01 00:00:00', '2027-06-30 23:59:59', true);

INSERT INTO "team_assignments" ("id", "player_id", "team_id", "season_id")
SELECT gen_random_uuid()::text, p."id", p."team_id", s."id"
FROM "players" p, "seasons" s
WHERE s."is_active" = true AND p."is_active" = true;

-- Backfill: postojeće parent_user_id veze u parent_links
INSERT INTO "parent_links" ("id", "user_id", "player_id")
SELECT gen_random_uuid()::text, p."parent_user_id", p."id"
FROM "players" p
WHERE p."parent_user_id" IS NOT NULL
ON CONFLICT DO NOTHING;
