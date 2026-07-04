-- Rename wire transfer clearance stage columns to their real-world compliance terms
-- taaCode -> ctrCode (Currency Transaction Report Code)
-- cotCode -> sarCode (Suspicious Activity Report Code)
-- imfCode -> sdnCode (Specially Designated Nationals Screening Code)
-- ijyCode -> cftCode (Combating the Financing of Terrorism Code)
ALTER TABLE "WireTransfer" RENAME COLUMN "taaCode" TO "ctrCode";
ALTER TABLE "WireTransfer" RENAME COLUMN "cotCode" TO "sarCode";
ALTER TABLE "WireTransfer" RENAME COLUMN "imfCode" TO "sdnCode";
ALTER TABLE "WireTransfer" RENAME COLUMN "ijyCode" TO "cftCode";

-- Update currentStage default to match the new first stage name
ALTER TABLE "WireTransfer" ALTER COLUMN "currentStage" SET DEFAULT 'CTR';

-- Remap existing in-flight rows so they aren't stranded on the old stage names
UPDATE "WireTransfer" SET "currentStage" = 'CTR' WHERE "currentStage" = 'TAA';
UPDATE "WireTransfer" SET "currentStage" = 'SAR' WHERE "currentStage" = 'COT';
UPDATE "WireTransfer" SET "currentStage" = 'SDN' WHERE "currentStage" = 'IMF';
UPDATE "WireTransfer" SET "currentStage" = 'CFT' WHERE "currentStage" = 'IJY';
