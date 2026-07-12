-- Per-service admin restrictions on User (crypto trading, bill payments, loans),
-- each with an optional admin-supplied reason shown to the affected user.
ALTER TABLE "User" ADD COLUMN "cryptoRestricted" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "User" ADD COLUMN "cryptoRestrictedReason" TEXT;
ALTER TABLE "User" ADD COLUMN "billsRestricted" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "User" ADD COLUMN "billsRestrictedReason" TEXT;
ALTER TABLE "User" ADD COLUMN "loansRestricted" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "User" ADD COLUMN "loansRestrictedReason" TEXT;

-- Admin-only card lock: separate from the user-facing freeze toggle so a user
-- cannot self-reverse a lock the admin put in place.
ALTER TABLE "Card" ADD COLUMN "adminLocked" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Card" ADD COLUMN "adminLockReason" TEXT;
