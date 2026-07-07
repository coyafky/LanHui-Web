-- 每个城市最多 1 个非终止旗舰店（partial unique index 兜底）
CREATE UNIQUE INDEX IF NOT EXISTS store_one_flagship_per_city_idx
ON "Store" ("provinceSlug", "citySlug")
WHERE "level" = 'flagship' AND "status" <> 'terminated';
