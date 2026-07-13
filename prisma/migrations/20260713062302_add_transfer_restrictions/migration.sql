-- Per-user admin restrictions on local (internal) and international (wire)
-- transfers, matching the crypto/bills/loans restriction pattern added
-- in the previous migration.
ALTER TABLE "User" ADD COLUMN "localTransferRestricted" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "User" ADD COLUMN "localTransferRestrictedReason" TEXT;
ALTER TABLE "User" ADD COLUMN "wireTransferRestricted" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "User" ADD COLUMN "wireTransferRestrictedReason" TEXT;
