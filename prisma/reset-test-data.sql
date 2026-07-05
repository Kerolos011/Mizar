BEGIN;

TRUNCATE TABLE
  "OrderItem",
  "Order",
  "Customer",
  "ProductMedia",
  "Product",
  "Store",
  "User"
RESTART IDENTITY CASCADE;

COMMIT;