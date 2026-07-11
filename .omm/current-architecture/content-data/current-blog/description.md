文章由后台 CMS 写入 Article 表，公开 /news 页面通过 getArticles/getArticleBySlug 读取，并以 1 小时 ISR 缓存。发布动作仅按路径失效，构建时可能引入测试数据库内容。
