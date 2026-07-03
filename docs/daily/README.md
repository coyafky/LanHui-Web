# Daily Logs

> `docs/daily/YYYY-MM-DD/` 是当天工作的总索引。它不替代 PRD/SPEC/test report，而是把当天产出的文档、代码验证和遗留问题串起来。
>
> 最后更新: 2026-06-26

---

## 每日目录结构

```text
docs/daily/YYYY-MM-DD/
├── INDEX.md
├── problem/
├── screenshots/
└── artifacts/
```

其中只有 `INDEX.md` 必须存在；截图、问题图片和其他产物按需创建子目录。

---

## INDEX.md 必填内容

- 当日主题。
- 触发背景。
- 处理范围。
- 关联 PRD / SPEC / Plan / Test Report / Design Review / Research。
- 执行日志。
- 验证命令。
- 风险和遗留问题。
- 下一步建议。

---

## 归档原则

- 当天新增或修改的重要文档都要在 `INDEX.md` 链接。
- 不把完整 PRD/SPEC 内容复制进 daily，只写摘要和链接。
- 如果只是轻量问答，可以只在 daily 中记录结论；如果产生代码或规范变更，应链接对应正式文档。
