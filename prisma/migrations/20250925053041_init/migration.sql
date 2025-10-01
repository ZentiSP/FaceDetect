-- CreateTable
CREATE TABLE "public"."Log" (
    "id" SERIAL NOT NULL,
    "timestamp" TEXT NOT NULL,
    "detection" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Log_pkey" PRIMARY KEY ("id")
);
