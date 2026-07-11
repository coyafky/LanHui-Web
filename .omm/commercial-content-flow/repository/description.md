RSC 与 Route Handler 复用的 server-only 领域仓储，直接使用 Prisma，所有外部输入和输出均经过 Zod，不再回环访问自身 API。
