门店信息存 PostgreSQL，公开 /agent 页面通过 getStores/getProvinces/getCities 回环调用 API；门店写操作没有统一 CSRF 与缓存 tag 失效。
