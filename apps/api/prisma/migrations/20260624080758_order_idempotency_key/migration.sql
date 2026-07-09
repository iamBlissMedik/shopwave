-- Idempotent checkout: a unique, nullable key so a retried checkout returns the
-- original order instead of creating a duplicate.
ALTER TABLE "Order" ADD COLUMN "idempotencyKey" TEXT;
CREATE UNIQUE INDEX "Order_idempotencyKey_key" ON "Order"("idempotencyKey");
