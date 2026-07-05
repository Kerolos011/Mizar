-- Add Mizar Premium as a first-class StoreTemplate enum value.
ALTER TYPE "StoreTemplate" ADD VALUE IF NOT EXISTS 'MIZAR_PREMIUM';

-- Promote existing stores that already selected the premium template via templateConfig.
UPDATE "Store"
SET "template" = 'MIZAR_PREMIUM'
WHERE "templateConfig" ->> 'templateKey' = 'MIZAR_PREMIUM';
