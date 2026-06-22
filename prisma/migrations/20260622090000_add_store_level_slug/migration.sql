-- 1. level 字段(若不存在)
ALTER TABLE "Store" ADD COLUMN IF NOT EXISTS "level" VARCHAR(20) NOT NULL DEFAULT 'flagship';

-- 2. level 枚举 CHECK 约束
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'Store_level_check'
  ) THEN
    ALTER TABLE "Store" ADD CONSTRAINT "Store_level_check"
      CHECK ("level" IN ('flagship','premium','specialty','member'));
  END IF;
END $$;

-- 3. slug 允许空(原 NOT NULL → NULL)
ALTER TABLE "Store" ALTER COLUMN "slug" DROP NOT NULL;

-- 4. 索引
CREATE INDEX IF NOT EXISTS "Store_level_idx" ON "Store"("level");
CREATE INDEX IF NOT EXISTS "Store_level_status_idx" ON "Store"("level","status");