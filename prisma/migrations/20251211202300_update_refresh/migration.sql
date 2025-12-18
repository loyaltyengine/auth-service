/*
  Warnings:

  - Made the column `token_hash` on table `refresh_tokens` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "refresh_tokens" ALTER COLUMN "token_hash" SET NOT NULL;
