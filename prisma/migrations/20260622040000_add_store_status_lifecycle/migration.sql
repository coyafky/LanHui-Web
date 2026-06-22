ALTER TABLE "Store"
ADD COLUMN "status" TEXT NOT NULL DEFAULT 'pending',
ADD COLUMN "statusReason" TEXT,
ADD COLUMN "statusChangedAt" TIMESTAMP(3),
ADD COLUMN "statusChangedBy" TEXT;

UPDATE "Store"
SET
  "status" = CASE WHEN "isActive" THEN 'active' ELSE 'suspended' END,
  "statusChangedAt" = COALESCE("updatedAt", NOW());

CREATE INDEX "Store_status_idx" ON "Store"("status");
CREATE INDEX "Store_status_provinceSlug_idx" ON "Store"("status", "provinceSlug");
