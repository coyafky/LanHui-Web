# 官网公开页面

Server Components 通过 server-only repository 读取数据，使用 cacheTag/revalidateTag 或明确的 revalidatePath。图片通过 CDN 域名加载并保留固定宽高避免 CLS。