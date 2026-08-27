-- Pristupnice za članstvo u klubu (podržavajući članovi/navijači)

CREATE TABLE "club_members" (
    "id" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "message" TEXT,
    "status" "RegistrationStatus" NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "club_members_pkey" PRIMARY KEY ("id")
);
