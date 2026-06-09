-- 将现有 Store 记录的 cuid 格式 ID 更新为自定义6位数字 ID
-- 外键 AnalyticsEvent.storeId 设有 ON UPDATE CASCADE，会自动跟随更新
UPDATE "Store" SET id = '100001' WHERE slug = 'shunde-daliang';
UPDATE "Store" SET id = '100002' WHERE slug = 'shunde-ronggui';
UPDATE "Store" SET id = '100003' WHERE slug = 'foshan-nanhai';
UPDATE "Store" SET id = '100004' WHERE slug = 'nanjing-jiangning';
UPDATE "Store" SET id = '100005' WHERE slug = 'suzhou-yuanqu';
UPDATE "Store" SET id = '100006' WHERE slug = 'hangzhou-xiaoshan';
UPDATE "Store" SET id = '100007' WHERE slug = 'foshan-chancheng';
