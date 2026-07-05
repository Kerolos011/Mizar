/*
  Warnings:

  - A unique constraint covering the columns `[storeId,slug]` on the table `Product` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "ProductStatus" AS ENUM ('DRAFT', 'ACTIVE', 'HIDDEN', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ProductType" AS ENUM ('SIMPLE', 'VARIABLE', 'DIGITAL', 'SERVICE', 'BUNDLE', 'SUBSCRIPTION');

-- CreateEnum
CREATE TYPE "ProductVariantStatus" AS ENUM ('ACTIVE', 'HIDDEN', 'OUT_OF_STOCK', 'DISABLED');

-- CreateEnum
CREATE TYPE "InventoryPolicy" AS ENUM ('STOP_WHEN_OUT', 'CONTINUE_SELLING');

-- CreateEnum
CREATE TYPE "MediaSource" AS ENUM ('UPLOAD', 'URL', 'YOUTUBE', 'VIMEO');

-- CreateEnum
CREATE TYPE "ProductAttachmentType" AS ENUM ('PDF', 'MANUAL', 'WARRANTY', 'INSTALLATION', 'CATALOG', 'OTHER');

-- CreateEnum
CREATE TYPE "ReviewStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'HIDDEN', 'SPAM');

-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "productName" TEXT,
ADD COLUMN     "profit" DOUBLE PRECISION,
ADD COLUMN     "sku" TEXT,
ADD COLUMN     "total" DOUBLE PRECISION,
ADD COLUMN     "unitCost" DOUBLE PRECISION,
ADD COLUMN     "variantId" TEXT,
ADD COLUMN     "variantTitle" TEXT;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "availableStock" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "badges" JSONB,
ADD COLUMN     "brand" TEXT,
ADD COLUMN     "campaignIds" JSONB,
ADD COLUMN     "canonicalUrl" TEXT,
ADD COLUMN     "compareAtPrice" DOUBLE PRECISION,
ADD COLUMN     "costPrice" DOUBLE PRECISION,
ADD COLUMN     "countryOfOrigin" TEXT,
ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'EGP',
ADD COLUMN     "customFields" JSONB,
ADD COLUMN     "discountPrice" DOUBLE PRECISION,
ADD COLUMN     "externalProductId" TEXT,
ADD COLUMN     "fullDescription" TEXT,
ADD COLUMN     "height" DOUBLE PRECISION,
ADD COLUMN     "includesTax" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "internalNotes" TEXT,
ADD COLUMN     "inventoryPolicy" "InventoryPolicy" NOT NULL DEFAULT 'STOP_WHEN_OUT',
ADD COLUMN     "isBestSeller" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isFeatured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isNewArrival" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "keywords" JSONB,
ADD COLUMN     "length" DOUBLE PRECISION,
ADD COLUMN     "lowStockAlert" INTEGER NOT NULL DEFAULT 5,
ADD COLUMN     "maxDiscountPercent" DOUBLE PRECISION,
ADD COLUMN     "metaDescription" TEXT,
ADD COLUMN     "metaTitle" TEXT,
ADD COLUMN     "minSellingPrice" DOUBLE PRECISION,
ADD COLUMN     "ogDescription" TEXT,
ADD COLUMN     "ogImage" TEXT,
ADD COLUMN     "ogTitle" TEXT,
ADD COLUMN     "packageType" TEXT,
ADD COLUMN     "preparationDays" INTEGER,
ADD COLUMN     "ratingAverage" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "ratingCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "requiresShipping" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "reservedStock" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "seoKeywords" JSONB,
ADD COLUMN     "shippingNotes" TEXT,
ADD COLUMN     "shortDescription" TEXT,
ADD COLUMN     "showOnHome" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "slug" TEXT,
ADD COLUMN     "status" "ProductStatus" NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN     "supplierName" TEXT,
ADD COLUMN     "tags" JSONB,
ADD COLUMN     "taxRate" DOUBLE PRECISION,
ADD COLUMN     "trackInventory" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "type" "ProductType" NOT NULL DEFAULT 'SIMPLE',
ADD COLUMN     "warrantyInfo" TEXT,
ADD COLUMN     "weight" DOUBLE PRECISION,
ADD COLUMN     "width" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "ProductMedia" ADD COLUMN     "altText" TEXT,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "displayMode" TEXT,
ADD COLUMN     "durationSeconds" INTEGER,
ADD COLUMN     "height" INTEGER,
ADD COLUMN     "isCover" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "mimeType" TEXT,
ADD COLUMN     "sizeBytes" INTEGER,
ADD COLUMN     "source" "MediaSource" NOT NULL DEFAULT 'UPLOAD',
ADD COLUMN     "thumbnailUrl" TEXT,
ADD COLUMN     "title" TEXT,
ADD COLUMN     "variantId" TEXT,
ADD COLUMN     "webpUrl" TEXT,
ADD COLUMN     "width" INTEGER;

-- CreateTable
CREATE TABLE "ProductOption" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "values" JSONB NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductVariant" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "sku" TEXT,
    "barcode" TEXT,
    "options" JSONB,
    "imageUrl" TEXT,
    "price" DOUBLE PRECISION NOT NULL,
    "compareAtPrice" DOUBLE PRECISION,
    "costPrice" DOUBLE PRECISION,
    "weight" DOUBLE PRECISION,
    "length" DOUBLE PRECISION,
    "width" DOUBLE PRECISION,
    "height" DOUBLE PRECISION,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "reservedQuantity" INTEGER NOT NULL DEFAULT 0,
    "availableQuantity" INTEGER NOT NULL DEFAULT 0,
    "lowStockAlert" INTEGER NOT NULL DEFAULT 5,
    "location" TEXT,
    "supplierSku" TEXT,
    "serialNumber" TEXT,
    "batchNumber" TEXT,
    "expirationDate" TIMESTAMP(3),
    "inventoryPolicy" "InventoryPolicy" NOT NULL DEFAULT 'STOP_WHEN_OUT',
    "status" "ProductVariantStatus" NOT NULL DEFAULT 'ACTIVE',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductVariant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductAttachment" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "variantId" TEXT,
    "type" "ProductAttachmentType" NOT NULL DEFAULT 'OTHER',
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "mimeType" TEXT,
    "sizeBytes" INTEGER,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "visibleToCustomer" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductAttachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductAttributeDefinition" (
    "id" TEXT NOT NULL,
    "storeId" TEXT,
    "businessType" TEXT,
    "category" TEXT,
    "key" TEXT NOT NULL,
    "labelAr" TEXT NOT NULL,
    "labelEn" TEXT,
    "dataType" TEXT NOT NULL,
    "inputType" TEXT NOT NULL DEFAULT 'text',
    "options" JSONB,
    "visibleToCustomer" BOOLEAN NOT NULL DEFAULT true,
    "visibleToMerchant" BOOLEAN NOT NULL DEFAULT true,
    "internalOnly" BOOLEAN NOT NULL DEFAULT false,
    "required" BOOLEAN NOT NULL DEFAULT false,
    "searchable" BOOLEAN NOT NULL DEFAULT false,
    "filterable" BOOLEAN NOT NULL DEFAULT false,
    "comparable" BOOLEAN NOT NULL DEFAULT false,
    "defaultValue" JSONB,
    "validationRules" JSONB,
    "dependsOn" JSONB,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductAttributeDefinition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductReview" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "customerId" TEXT,
    "userId" TEXT,
    "orderId" TEXT,
    "rating" INTEGER NOT NULL,
    "title" TEXT,
    "body" TEXT,
    "displayName" TEXT,
    "isAnonymous" BOOLEAN NOT NULL DEFAULT false,
    "verifiedPurchase" BOOLEAN NOT NULL DEFAULT false,
    "status" "ReviewStatus" NOT NULL DEFAULT 'PENDING',
    "helpfulCount" INTEGER NOT NULL DEFAULT 0,
    "reportCount" INTEGER NOT NULL DEFAULT 0,
    "merchantReply" TEXT,
    "merchantReplyAt" TIMESTAMP(3),
    "adminReply" TEXT,
    "adminReplyAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductReviewMedia" (
    "id" TEXT NOT NULL,
    "reviewId" TEXT NOT NULL,
    "type" "ProductMediaType" NOT NULL,
    "url" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductReviewMedia_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProductOption_productId_idx" ON "ProductOption"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "ProductOption_productId_name_key" ON "ProductOption"("productId", "name");

-- CreateIndex
CREATE INDEX "ProductVariant_productId_idx" ON "ProductVariant"("productId");

-- CreateIndex
CREATE INDEX "ProductVariant_storeId_idx" ON "ProductVariant"("storeId");

-- CreateIndex
CREATE INDEX "ProductVariant_sku_idx" ON "ProductVariant"("sku");

-- CreateIndex
CREATE INDEX "ProductVariant_barcode_idx" ON "ProductVariant"("barcode");

-- CreateIndex
CREATE INDEX "ProductVariant_status_idx" ON "ProductVariant"("status");

-- CreateIndex
CREATE UNIQUE INDEX "ProductVariant_storeId_sku_key" ON "ProductVariant"("storeId", "sku");

-- CreateIndex
CREATE INDEX "ProductAttachment_productId_idx" ON "ProductAttachment"("productId");

-- CreateIndex
CREATE INDEX "ProductAttachment_variantId_idx" ON "ProductAttachment"("variantId");

-- CreateIndex
CREATE INDEX "ProductAttachment_type_idx" ON "ProductAttachment"("type");

-- CreateIndex
CREATE INDEX "ProductAttributeDefinition_storeId_idx" ON "ProductAttributeDefinition"("storeId");

-- CreateIndex
CREATE INDEX "ProductAttributeDefinition_businessType_idx" ON "ProductAttributeDefinition"("businessType");

-- CreateIndex
CREATE INDEX "ProductAttributeDefinition_category_idx" ON "ProductAttributeDefinition"("category");

-- CreateIndex
CREATE INDEX "ProductAttributeDefinition_key_idx" ON "ProductAttributeDefinition"("key");

-- CreateIndex
CREATE INDEX "ProductReview_productId_idx" ON "ProductReview"("productId");

-- CreateIndex
CREATE INDEX "ProductReview_storeId_idx" ON "ProductReview"("storeId");

-- CreateIndex
CREATE INDEX "ProductReview_customerId_idx" ON "ProductReview"("customerId");

-- CreateIndex
CREATE INDEX "ProductReview_userId_idx" ON "ProductReview"("userId");

-- CreateIndex
CREATE INDEX "ProductReview_orderId_idx" ON "ProductReview"("orderId");

-- CreateIndex
CREATE INDEX "ProductReview_status_idx" ON "ProductReview"("status");

-- CreateIndex
CREATE INDEX "ProductReview_rating_idx" ON "ProductReview"("rating");

-- CreateIndex
CREATE INDEX "ProductReview_createdAt_idx" ON "ProductReview"("createdAt");

-- CreateIndex
CREATE INDEX "ProductReviewMedia_reviewId_idx" ON "ProductReviewMedia"("reviewId");

-- CreateIndex
CREATE INDEX "OrderItem_variantId_idx" ON "OrderItem"("variantId");

-- CreateIndex
CREATE INDEX "OrderItem_sku_idx" ON "OrderItem"("sku");

-- CreateIndex
CREATE INDEX "Product_status_idx" ON "Product"("status");

-- CreateIndex
CREATE INDEX "Product_type_idx" ON "Product"("type");

-- CreateIndex
CREATE INDEX "Product_isFeatured_idx" ON "Product"("isFeatured");

-- CreateIndex
CREATE INDEX "Product_createdAt_idx" ON "Product"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Product_storeId_slug_key" ON "Product"("storeId", "slug");

-- CreateIndex
CREATE INDEX "ProductMedia_variantId_idx" ON "ProductMedia"("variantId");

-- CreateIndex
CREATE INDEX "ProductMedia_isCover_idx" ON "ProductMedia"("isCover");

-- CreateIndex
CREATE INDEX "ProductMedia_sortOrder_idx" ON "ProductMedia"("sortOrder");

-- AddForeignKey
ALTER TABLE "ProductOption" ADD CONSTRAINT "ProductOption_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductVariant" ADD CONSTRAINT "ProductVariant_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductVariant" ADD CONSTRAINT "ProductVariant_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductMedia" ADD CONSTRAINT "ProductMedia_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "ProductVariant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductAttachment" ADD CONSTRAINT "ProductAttachment_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductAttachment" ADD CONSTRAINT "ProductAttachment_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "ProductVariant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductAttributeDefinition" ADD CONSTRAINT "ProductAttributeDefinition_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductReview" ADD CONSTRAINT "ProductReview_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductReview" ADD CONSTRAINT "ProductReview_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductReview" ADD CONSTRAINT "ProductReview_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductReview" ADD CONSTRAINT "ProductReview_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductReview" ADD CONSTRAINT "ProductReview_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductReviewMedia" ADD CONSTRAINT "ProductReviewMedia_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "ProductReview"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "ProductVariant"("id") ON DELETE SET NULL ON UPDATE CASCADE;
