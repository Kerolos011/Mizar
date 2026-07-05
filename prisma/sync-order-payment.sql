BEGIN;

UPDATE "Order"
SET "paymentMethod" = COALESCE(
  NULLIF("paymentMethod", ''),
  NULLIF("payment", ''),
  'CASH_ON_DELIVERY'
);

UPDATE "Order"
SET "payment" = COALESCE(
  NULLIF("paymentMethod", ''),
  NULLIF("payment", ''),
  'CASH_ON_DELIVERY'
);

COMMIT;