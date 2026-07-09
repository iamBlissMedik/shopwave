-- A cart can now belong to an anonymous guest session instead of a user.
-- Make userId nullable and add a unique, nullable sessionId.
ALTER TABLE "Cart" ALTER COLUMN "userId" DROP NOT NULL;
ALTER TABLE "Cart" ADD COLUMN "sessionId" TEXT;
CREATE UNIQUE INDEX "Cart_sessionId_key" ON "Cart"("sessionId");
