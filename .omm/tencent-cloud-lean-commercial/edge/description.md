# 域名 / TLS / CVM Nginx

宿主机 Nginx 终止 HTTPS、注入代理头、限制上传体积、设置安全头，并把流量切到 blue 或 green 端口。配置切换后 nginx -t 通过才 reload。