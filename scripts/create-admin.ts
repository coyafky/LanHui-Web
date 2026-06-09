/**
 * 创建管理员用户脚本
 *
 * 使用方式：
 *   npx tsx scripts/create-admin.ts --username admin2 --email admin2@lanhui.com --password newpass123
 *   npx tsx scripts/create-admin.ts --username editor1 --email editor1@lanhui.com --password securePass --role editor
 *
 * 可选参数：
 *   --role     用户角色，默认 admin（可选值：admin / editor）
 *   --name     显示名称，默认与 username 相同
 *
 * 环境要求：
 *   - DATABASE_URL 环境变量已配置（从 .env 文件读取）
 *   - 已运行 prisma generate 生成 Client
 */

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

// ── 解析命令行参数 ──

function parseArgs(): {
  username: string;
  email: string;
  password: string;
  role: string;
  name: string;
} {
  const args = process.argv.slice(2);

  const getArg = (name: string): string | undefined => {
    const idx = args.indexOf(`--${name}`);
    if (idx === -1 || idx + 1 >= args.length) return undefined;
    return args[idx + 1];
  };

  const username = getArg("username");
  const email = getArg("email");
  const password = getArg("password");

  if (!username || !email || !password) {
    console.error("❌ 缺少必填参数");
    console.error("");
    console.error("使用方式：");
    console.error(
      "  npx tsx scripts/create-admin.ts --username <用户名> --email <邮箱> --password <密码> [--role <角色>] [--name <显示名>]"
    );
    console.error("");
    console.error("参数说明：");
    console.error("  --username   用户名（必填，唯一）");
    console.error("  --email      邮箱（必填，唯一）");
    console.error("  --password   密码（必填）");
    console.error("  --role       角色，默认 admin（可选值：admin / editor）");
    console.error("  --name       显示名称，默认与 username 相同");
    process.exit(1);
  }

  const role = getArg("role") ?? "admin";
  const name = getArg("name") ?? username;

  if (role !== "admin" && role !== "editor") {
    console.error(`❌ 无效角色: ${role}，可选值：admin / editor`);
    process.exit(1);
  }

  if (password.length < 6) {
    console.error("❌ 密码长度不能少于 6 位");
    process.exit(1);
  }

  return { username, email, password, role, name };
}

// ── 主逻辑 ──

async function main() {
  const { username, email, password, role, name } = parseArgs();

  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter });

  try {
    // 检查是否已存在同名用户
    const existing = await prisma.user.findFirst({
      where: {
        OR: [{ username }, { email }],
      },
    });

    if (existing) {
      if (existing.username === username) {
        console.error(`❌ 用户名 "${username}" 已存在`);
      } else {
        console.error(`❌ 邮箱 "${email}" 已存在`);
      }
      process.exit(1);
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);

    // 创建用户
    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        name,
        role,
        status: "active",
      },
    });

    console.log("✅ 用户创建成功！");
    console.log(`   ID:       ${user.id}`);
    console.log(`   用户名:   ${user.username}`);
    console.log(`   邮箱:     ${user.email}`);
    console.log(`   显示名:   ${user.name}`);
    console.log(`   角色:     ${user.role}`);
    console.log(`   状态:     ${user.status}`);
  } catch (error) {
    console.error("❌ 创建用户失败:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
