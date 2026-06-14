import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Server, Cpu, Database, Globe, UserCog } from "lucide-react";

interface PackageJson {
  version?: string;
  dependencies?: Record<string, string>;
}

async function readPackageVersion(packageName: string): Promise<string | null> {
  try {
    const path = join(process.cwd(), "node_modules", packageName, "package.json");
    const raw = await readFile(path, "utf8");
    const json = JSON.parse(raw) as PackageJson;
    return json.version ?? null;
  } catch {
    return null;
  }
}

interface RowProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  full?: boolean;
}

function Row({ icon: Icon, label, value, full }: RowProps) {
  return (
    <div className={full ? "sm:col-span-2" : undefined}>
      <div className="flex items-center gap-1.5 text-xs text-zinc-500">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <div className="mt-0.5 text-sm text-zinc-200">
        {value || "—"}
      </div>
    </div>
  );
}

export async function SystemTab() {
  const [nextVersion, prismaVersion, session, dbOk] = await Promise.all([
    safeNextVersion(),
    readPackageVersion("@prisma/client"),
    auth(),
    safeDbPing(),
  ]);

  return (
    <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
      <div className="mb-4 flex items-center gap-2">
        <h2 className="text-lg font-semibold text-zinc-100">系统信息</h2>
        <span className="text-xs bg-zinc-800 text-zinc-500 px-2 py-0.5 rounded">
          只读
        </span>
      </div>

      <div className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
        <Row icon={Server} label="Next.js" value={nextVersion ?? "—"} />
        <Row icon={Cpu} label="Node.js" value={process.version} />
        <Row icon={Server} label="@prisma/client" value={prismaVersion ?? "—"} />
        <Row icon={Globe} label="运行环境" value={process.env.NODE_ENV ?? "—"} />

        <Row
          icon={Database}
          label="数据库连接"
          value={dbOk ? "✅ 已连接" : "❌ 未连接"}
        />

        {session?.user && (
          <>
            <Row icon={UserCog} label="当前角色" value={session.user.role ?? "—"} />
            <Row
              icon={UserCog}
              label="当前用户"
              value={session.user.name ?? session.user.email ?? "—"}
              full
            />
          </>
        )}
      </div>
    </section>
  );
}

async function safeNextVersion(): Promise<string | null> {
  try {
    const path = join(process.cwd(), "package.json");
    const raw = await readFile(path, "utf8");
    const json = JSON.parse(raw) as PackageJson;
    return json.dependencies?.next ?? json.version ?? null;
  } catch {
    return null;
  }
}

async function safeDbPing(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (e) {
    console.error("[SystemTab] db ping", e);
    return false;
  }
}
