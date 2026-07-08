#!/usr/bin/env node
/**
 * PostgreSQL 数据库恢复脚本
 *
 * 从备份文件恢复数据库，默认拒绝执行，需 --yes 确认。
 *
 * 用法:
 *   npm run db:restore -- ./backups/lanhui-db_20260707_030000.sql.gz --yes
 *
 * 环境变量:
 *   DATABASE_URL — 必需，目标 PG 连接串
 */

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { gunzipSync } from "node:zlib";

function parseArgs() {
  const positional = [];
  let yes = false;
  for (const arg of process.argv.slice(2)) {
    if (arg === "--yes") {
      yes = true;
    } else if (!arg.startsWith("-")) {
      positional.push(arg);
    }
  }
  return { filePath: positional[0] || null, yes };
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

function checkPsql() {
  try {
    execFileSync("psql", ["--version"], { stdio: "pipe" });
    return true;
  } catch {
    return false;
  }
}

function isGzipped(filePath) {
  return filePath.endsWith(".gz");
}

function restore() {
  const { filePath, yes } = parseArgs();

  // Guard 1: backup file path required
  if (!filePath) {
    console.error("ERROR: No backup file specified.");
    console.error("Usage: npm run db:restore -- <backup-file> --yes");
    process.exit(1);
  }

  // Guard 2: --yes required
  if (!yes) {
    console.error("ERROR: Refusing to restore without --yes flag.");
    console.error("");
    console.error("Restoring will OVERWRITE the current database.");
    console.error("If you are sure, run:");
    console.error(`  npm run db:restore -- ${filePath} --yes`);
    process.exit(1);
  }

  // Guard 3: backup file exists
  if (!existsSync(filePath)) {
    console.error(`ERROR: Backup file not found: ${filePath}`);
    console.error("Please check the file path and try again.");
    process.exit(1);
  }

  // Guard 4: DATABASE_URL
  const rawUrl = process.env.DATABASE_URL;
  if (!rawUrl) {
    console.error("ERROR: DATABASE_URL is not set.");
    console.error("Please set DATABASE_URL in your environment and try again.");
    process.exit(1);
  }

  // Guard 5: psql available
  if (!checkPsql()) {
    console.error("ERROR: psql not found.");
    console.error("Please install PostgreSQL client tools:");
    console.error("  macOS:  brew install libpq");
    console.error("  Ubuntu: sudo apt install postgresql-client");
    console.error("  Alpine: apk add postgresql-client");
    process.exit(1);
  }

  const db = parseDatabaseUrl(rawUrl);

  // ╔══════════════════════════════════════════════════════════════╗
  // ║                    RESTORE WARNING                          ║
  // ╠══════════════════════════════════════════════════════════════╣
  // ║ This will OVERWRITE the current database with the backup.   ║
  // ║ All current data will be LOST.                              ║
  // ╠══════════════════════════════════════════════════════════════╣
  // ║ Target host: <host>                                         ║
  // ║ Target db:   <database>                                     ║
  // ║ Backup file: <file>                                         ║
  // ╠══════════════════════════════════════════════════════════════╣
  // ║ TIP: Run a backup first: npm run db:backup                  ║
  // ╚══════════════════════════════════════════════════════════════╝

  const boxWidth = 64;
  const line = "═".repeat(boxWidth);
  const thinLine = "─".repeat(boxWidth);
  const pad = (text, max) => text + " ".repeat(Math.max(0, max - text.length));

  console.log(`╔${line}╗`);
  console.log(`║${pad("RESTORE WARNING", boxWidth)}║`);
  console.log(`╠${line}╣`);
  console.log(`║${pad("This will OVERWRITE the current database with the backup.", boxWidth)}║`);
  console.log(`║${pad("All current data will be LOST.", boxWidth)}║`);
  console.log(`╠${thinLine}╣`);
  console.log(`║${pad(`Target host: ${db.host}`, boxWidth)}║`);
  console.log(`║${pad(`Target db:   ${db.database}`, boxWidth)}║`);
  console.log(`║${pad(`Backup file: ${filePath}`, boxWidth)}║`);
  console.log(`╠${thinLine}╣`);
  console.log(`║${pad("TIP: Run a backup first: npm run db:backup", boxWidth)}║`);
  console.log(`╚${line}╝`);
  console.log("");

  const psqlArgs = [
    "-h", db.host,
    "-p", db.port,
    "-U", db.username,
    "-d", db.database,
    "--no-password",
    "-v", "ON_ERROR_STOP=1",
  ];

  // Read and optionally decompress the backup
  let sqlContent;
  if (isGzipped(filePath)) {
    console.log(`Decompressing ${filePath}...`);
    sqlContent = gunzipSync(readFileSync(filePath));
  } else {
    console.log(`Reading ${filePath}...`);
    sqlContent = readFileSync(filePath);
  }

  const startTime = Date.now();
  console.log(`Restore started at ${new Date(startTime).toISOString()}`);
  console.log(`Target: ${redactUrl(rawUrl)}`);

  const env = { ...process.env, PGPASSWORD: db.password };

  try {
    execFileSync("psql", psqlArgs, {
      stdio: "pipe",
      input: sqlContent,
      env,
      maxBuffer: 500 * 1024 * 1024, // 500MB
    });
  } catch (err) {
    console.error("ERROR: psql restore failed.");
    console.error(err.stderr?.toString() || err.message);
    process.exit(1);
  } finally {
    // PGPASSWORD only existed in the forked env
  }

  const endTime = Date.now();
  const duration = endTime - startTime;
  const durationStr = duration < 1000 ? `${duration}ms` : `${(duration / 1000).toFixed(1)}s`;

  console.log(`Restore completed in ${durationStr}.`);
  console.log("");

  // Post-restore checklist
  const checklistWidth = 58;
  const cl = "─".repeat(checklistWidth);
  console.log("┌" + cl + "┐");
  console.log("│" + pad("Post-restore Checklist", checklistWidth) + "│");
  console.log("├" + cl + "┤");
  console.log("│" + pad("1. Check migration status:", checklistWidth) + "│");
  console.log("│" + pad("   npx prisma migrate status", checklistWidth) + "│");
  console.log("│" + pad("2. Rebuild the application:", checklistWidth) + "│");
  console.log("│" + pad("   npm run build", checklistWidth) + "│");
  console.log("│" + pad("3. Log into admin dashboard:", checklistWidth) + "│");
  console.log("│" + pad("   Check Store and Article counts", checklistWidth) + "│");
  console.log("│" + pad("4. Verify public site renders correctly:", checklistWidth) + "│");
  console.log("│" + pad("   Open /agent and /news in browser", checklistWidth) + "│");
  console.log("└" + cl + "┘");
}

restore();
