-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "accessToken" TEXT NOT NULL DEFAULT replace(gen_random_uuid()::text, '-', '');
