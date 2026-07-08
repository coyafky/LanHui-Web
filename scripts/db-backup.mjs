#!/usr/bin/env node
/**
 * PostgreSQL 数据库备份脚本
 *
 * 从 DATABASE_URL 读取连接信息，调用 pg_dump + gzip 生成压缩备份。
 *
 * 用法:
 *   npm run db:backup
 *   npm run db:backup:dry-run    # 只打印命令，不执行
 *   BACKUP_DIR=./my-backups BACKUP_RETENTION_DAYS=60 npm run db:backup
 *
 * 环境变量:
 *   DATABASE_URL            — 必需，PG 连接串
 *   BACKUP_DIR              — 备份目录，默认 ./backups
 *   BACKUP_RETENTION_DAYS   — 保留天数，默认 30
 */

import { execFileSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  readdirSync,
  statSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { join, resolve } from "node:path";
import { gzipSync } from "node:zlib";

const ROOT = resolve(new URL(".", import.meta.url).pathname, "..");

function parseArgs() {
  const args = process.argv.slice(2);
  return {
    dryRun: args.includes("--dry-run"),
    noRetention: args.includes("--no-retention"),
  };
}

function parseDatabaseUrl(rawUrl) {
  const url = new URL(rawUrl);
  return {
    host: url.hostname,
    port: url.port || "5432",
    database: url.pathname.replace(/^\//, ""),
    username: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
  };
}

function redactUrl(rawUrl) {
  try {
    const u = new URL(rawUrl);
    if (u.password) u.password = "***";
    return u.toString();
  } catch {
    return "DATABASE_URL (parse error)";
  }
}

function checkPgDump() {
  try {
    execFileSync("pg_dump", ["--version"], { stdio: "pipe" });
    return true;
  } catch {
    return false;
  }
}

function getBackupFiles(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => /^lanhui-db_\d{8}_\d{6}\.sql\.gz$/.test(f))
    .map((f) => ({ name: f, path: join(dir, f) }));
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDuration(ms) {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

function buildTimestamp() {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return [
    now.getFullYear(),
    pad(now.getMonth() + 1),
    pad(now.getDate()),
    "_",
    pad(now.getHours()),
    pad(now.getMinutes()),
    pad(now.getSeconds()),
  ].join("");
}

function backup() {
  const { dryRun, noRetention } = parseArgs();

  const rawUrl = process.env.DATABASE_URL;
  if (!rawUrl) {
    console.error("ERROR: DATABASE_URL is not set.");
    console.error("Please set DATABASE_URL in your environment and try again.");
    process.exit(1);
  }

  if (!checkPgDump()) {
    console.error("ERROR: pg_dump not found.");
    console.error("Please install PostgreSQL client tools:");
    console.error("  macOS:  brew install libpq");
    console.error("  Ubuntu: sudo apt install postgresql-client");
    console.error("  Alpine: apk add postgresql-client");
    process.exit(1);
  }

  const db = parseDatabaseUrl(rawUrl);
  const backupDir = resolve(process.env.BACKUP_DIR || join(ROOT, "backups"));
  const retentionDays = parseInt(
    process.env.BACKUP_RETENTION_DAYS || "30",
    10
  );

  const ts = buildTimestamp();
  const fileName = `lanhui-db_${ts}.sql.gz`;
  const filePath = join(backupDir, fileName);

  const pgDumpArgs = [
    "-h",
    db.host,
    "-p",
    db.port,
    "-U",
    db.username,
    "-d",
    db.database,
    "--no-password",
    "--no-owner",
    "--no-acl",
  ];

  if (dryRun) {
    console.log("=== DRY RUN ===");
    console.log(`Command: pg_dump ${pgDumpArgs.join(" ")} | gzip > ${filePath}`);
    console.log(`Backup dir: ${backupDir}`);
    console.log(`Retention: ${retentionDays} days`);
    console.log(`Target DB: ${redactUrl(rawUrl)}`);
    console.log("=== DRY RUN === (no backup executed)");
    return;
  }

  if (!existsSync(backupDir)) {
    mkdirSync(backupDir, { recursive: true });
    console.log(`Created backup directory: ${backupDir}`);
  }

  const startTime = Date.now();
  console.log(`Backup started at ${new Date(startTime).toISOString()}`);
  console.log(`Target: ${redactUrl(rawUrl)}`);

  const env = { ...process.env, PGPASSWORD: db.password };

  try {
    const dump = execFileSync("pg_dump", pgDumpArgs, {
      stdio: "pipe",
      env,
      maxBuffer: 500 * 1024 * 1024, // 500MB
    });

    const compressed = gzipSync(dump, { level: 6 });
    writeFileSync(filePath, compressed);
  } finally {
    // PGPASSWORD only existed in the forked env, but clear it anyway
  }

  const endTime = Date.now();
  const fileSize = statSync(filePath).size;

  console.log("Backup completed:");
  console.log(`  File:      ${filePath}`);
  console.log(`  Size:      ${formatBytes(fileSize)}`);
  console.log(`  Started:   ${new Date(startTime).toISOString()}`);
  console.log(`  Finished:  ${new Date(endTime).toISOString()}`);
  console.log(`  Duration:  ${formatDuration(endTime - startTime)}`);

  if (!noRetention) {
    const files = getBackupFiles(backupDir);
    const cutoff = Date.now() - retentionDays * 24 * 60 * 60 * 1000;
    let cleaned = 0;
    for (const f of files) {
      if (f.path === filePath) continue;
      if (statSync(f.path).mtimeMs < cutoff) {
        unlinkSync(f.path);
        cleaned++;
        console.log(`  Cleaned old backup: ${f.name}`);
      }
    }
    if (cleaned > 0) {
      console.log(`  Total cleaned: ${cleaned} old backup(s)`);
    }
  }
}

backup();
