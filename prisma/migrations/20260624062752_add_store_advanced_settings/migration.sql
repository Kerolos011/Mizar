-- AlterTable
ALTER TABLE "Store" ADD COLUMN     "description" TEXT,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "primaryColor" TEXT NOT NULL DEFAULT '#2563EB',
ADD COLUMN     "shippingFee" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "shippingPolicy" TEXT,
ADD COLUMN     "whatsapp" TEXT;
