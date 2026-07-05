-- CreateEnum
CREATE TYPE "StoreTemplate" AS ENUM ('GENERAL', 'FASHION', 'PERFUMES_BEAUTY', 'ACCESSORIES', 'HANDMADE', 'HOME_PRODUCTS', 'FOOD_BEVERAGE', 'ELECTRONICS');

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "attributes" JSONB,
ADD COLUMN     "options" JSONB,
ADD COLUMN     "variants" JSONB;

-- AlterTable
ALTER TABLE "Store" ADD COLUMN     "accentColor" TEXT NOT NULL DEFAULT '#2ED9B3',
ADD COLUMN     "address" TEXT,
ADD COLUMN     "area" TEXT,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "contactEmail" TEXT,
ADD COLUMN     "contactPhone" TEXT,
ADD COLUMN     "coverUrl" TEXT,
ADD COLUMN     "displayName" TEXT,
ADD COLUMN     "facebookUrl" TEXT,
ADD COLUMN     "fontPreset" TEXT NOT NULL DEFAULT 'cairo',
ADD COLUMN     "instagramUrl" TEXT,
ADD COLUMN     "layoutPreset" TEXT NOT NULL DEFAULT 'modern',
ADD COLUMN     "logoUrl" TEXT,
ADD COLUMN     "onboardingCompleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "onboardingCompletedAt" TIMESTAMP(3),
ADD COLUMN     "productSchema" JSONB,
ADD COLUMN     "tagline" TEXT,
ADD COLUMN     "template" "StoreTemplate" NOT NULL DEFAULT 'GENERAL',
ADD COLUMN     "templateConfig" JSONB,
ADD COLUMN     "tiktokUrl" TEXT,
ADD COLUMN     "websiteUrl" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "merchantOnboardingCompleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "merchantOnboardingCompletedAt" TIMESTAMP(3),
ADD COLUMN     "welcomeSeenAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Customer_storeId_idx" ON "Customer"("storeId");

-- CreateIndex
CREATE INDEX "Order_storeId_idx" ON "Order"("storeId");

-- CreateIndex
CREATE INDEX "Order_customerId_idx" ON "Order"("customerId");

-- CreateIndex
CREATE INDEX "Order_status_idx" ON "Order"("status");

-- CreateIndex
CREATE INDEX "OrderItem_orderId_idx" ON "OrderItem"("orderId");

-- CreateIndex
CREATE INDEX "OrderItem_productId_idx" ON "OrderItem"("productId");

-- CreateIndex
CREATE INDEX "Product_storeId_idx" ON "Product"("storeId");

-- CreateIndex
CREATE INDEX "Product_category_idx" ON "Product"("category");

-- CreateIndex
CREATE INDEX "Store_category_idx" ON "Store"("category");

-- CreateIndex
CREATE INDEX "Store_template_idx" ON "Store"("template");

-- CreateIndex
CREATE INDEX "Store_onboardingCompleted_idx" ON "Store"("onboardingCompleted");

-- CreateIndex
CREATE INDEX "User_merchantOnboardingCompleted_idx" ON "User"("merchantOnboardingCompleted");
