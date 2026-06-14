-- Add code (行政区划代码) and type (行政单元类别) to Province and City
-- Phase 1 / T1.2 of store-region management system

-- Province: code unique nullable, type nullable
ALTER TABLE "Province" ADD COLUMN "code" TEXT;
ALTER TABLE "Province" ADD COLUMN "type" TEXT;

-- City: code unique nullable, type nullable
ALTER TABLE "City" ADD COLUMN "code" TEXT;
ALTER TABLE "City" ADD COLUMN "type" TEXT;

-- Unique index on Province.code (NULL values allowed under PostgreSQL UNIQUE)
CREATE UNIQUE INDEX "Province_code_key" ON "Province"("code");

-- Unique index on City.code
CREATE UNIQUE INDEX "City_code_key" ON "City"("code");

-- Performance index: list active provinces in display order
CREATE INDEX "Province_isActive_order_idx" ON "Province"("isActive", "order");
