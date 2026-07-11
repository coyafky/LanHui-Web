# Prisma migrate deploy

先备份或确认 PITR 可用，再执行只向前且向后兼容的迁移。删除列、重命名列等破坏性 contract 延后至少一个版本。