-- CreateEnum
CREATE TYPE "public"."SeniorityLevel" AS ENUM ('junior', 'mid', 'senior');

-- CreateTable
CREATE TABLE "public"."prospects" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "headline" TEXT,
    "company" TEXT,
    "industry" TEXT,
    "seniorityLevel" "public"."SeniorityLevel",
    "location" TEXT,
    "linkedinUrl" TEXT NOT NULL,
    "rawData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "prospects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."tov_configs" (
    "id" TEXT NOT NULL,
    "formality" REAL NOT NULL,
    "warmth" REAL NOT NULL,
    "directness" REAL NOT NULL,
    "technicalDepth" REAL NOT NULL DEFAULT 0.5,
    "urgency" REAL NOT NULL DEFAULT 0.3,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tov_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ai_generations" (
    "id" TEXT NOT NULL,
    "modelUsed" TEXT NOT NULL,
    "promptTokens" INTEGER NOT NULL DEFAULT 0,
    "completionTokens" INTEGER NOT NULL DEFAULT 0,
    "totalCost" REAL NOT NULL DEFAULT 0,
    "thinkingProcess" TEXT,
    "rawResponse" JSONB,
    "success" BOOLEAN NOT NULL,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_generations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."message_sequences" (
    "id" TEXT NOT NULL,
    "prospectId" TEXT NOT NULL,
    "tovConfigId" TEXT,
    "aiGenerationId" TEXT,
    "companyContext" TEXT NOT NULL,
    "messages" JSONB NOT NULL,
    "prospectInsights" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "message_sequences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."sequence_performance" (
    "id" TEXT NOT NULL,
    "sequenceId" TEXT NOT NULL,
    "sentCount" INTEGER NOT NULL DEFAULT 0,
    "responseCount" INTEGER NOT NULL DEFAULT 0,
    "meetingBooked" BOOLEAN NOT NULL DEFAULT false,
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sequence_performance_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "prospects_linkedinUrl_key" ON "public"."prospects"("linkedinUrl");

-- CreateIndex
CREATE UNIQUE INDEX "sequence_performance_sequenceId_key" ON "public"."sequence_performance"("sequenceId");

-- AddForeignKey
ALTER TABLE "public"."message_sequences" ADD CONSTRAINT "message_sequences_prospectId_fkey" FOREIGN KEY ("prospectId") REFERENCES "public"."prospects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."message_sequences" ADD CONSTRAINT "message_sequences_tovConfigId_fkey" FOREIGN KEY ("tovConfigId") REFERENCES "public"."tov_configs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."message_sequences" ADD CONSTRAINT "message_sequences_aiGenerationId_fkey" FOREIGN KEY ("aiGenerationId") REFERENCES "public"."ai_generations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."sequence_performance" ADD CONSTRAINT "sequence_performance_sequenceId_fkey" FOREIGN KEY ("sequenceId") REFERENCES "public"."message_sequences"("id") ON DELETE CASCADE ON UPDATE CASCADE;
