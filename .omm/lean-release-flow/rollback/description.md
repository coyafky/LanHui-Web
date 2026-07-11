# 回滚

应用故障直接切回旧 upstream。数据库不执行自动 down migration；依赖向后兼容迁移与 PITR 处理数据级事故。COS 对象不可变，因此旧数据库引用仍可恢复。