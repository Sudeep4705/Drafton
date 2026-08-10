/*
  Warnings:

  - The `status` column on the `Recipient` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "RecipientStatus" AS ENUM ('PENDING', 'SENT', 'FAILED');

-- AlterTable
ALTER TABLE "Recipient" DROP COLUMN "status",
ADD COLUMN     "status" "RecipientStatus" NOT NULL DEFAULT 'PENDING';
