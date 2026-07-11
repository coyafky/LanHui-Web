公网域名先进入腾讯云边缘层：CDN 缓存不可变资源、可选 WAF 防护；动态页面和 API 经 HTTPS CLB 健康检查后转发到 CVM。/admin 与 /api 禁止公共缓存。
