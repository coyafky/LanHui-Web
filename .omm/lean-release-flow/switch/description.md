# Nginx 原子切流并 reload

替换 upstream 配置软链接，先执行 nginx -t，再 reload。已有连接自然结束，新连接进入候选槽。