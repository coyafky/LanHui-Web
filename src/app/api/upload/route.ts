/**
 * 上传 API（PRD §6.1 / §6.2）
 *
 * 支持 entity="store" / entity="article"。
 * 路径策略：服务端按 entity + entityId 拼接，不接受用户输入的文件名。
 * 文件安全：MIME 白名单 + sharp().metadata() 二次验证 + 5MB 限制。
 * 写入策略：临时文件 + rename 原子替换。
 */

import { NextRequest } from "next/server";
import { promises as fs } from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { requireCsrf } from "@/lib/security/csrf";
import { rateLimiter } from "@/lib/security/rate-limit";

// ── 常量 ──
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp"]);
const ENTITY_DIR: Record<string, string> = {
  store: "stores",
  article: "articles",
  // 架构预留：未来扩展时按 PRD §1.1 模板补全
  // province: "provinces",
  // product: "products",
};

// 显式拒绝 city：城市不需要图片
const REJECTED_ENTITIES = new Set(["city"]);

const SUPPORTED_ENTITIES = new Set(Object.keys(ENTITY_DIR));

/** 服务端独立拼路径，杜绝用户控制路径 */
function buildEntityPath(entity: keyof typeof ENTITY_DIR, entityId: string): { dir: string; file: string; rel: string } {
  // 防御：拒绝包含路径分隔符或父目录标记的 id
  if (/[\/\\\.]/.test(entityId) || entityId.includes("..")) {
    throw new Error("非法的 entityId");
  }
  const dirName = ENTITY_DIR[entity];
  const dir = path.join(process.cwd(), "public", "images", dirName);
  const file = `${entityId}.webp`;
  const rel = `/images/${dirName}/${file}`;
  return { dir, file, rel };
}

async function ensureUploadPermission(entity: string) {
  const session = await auth();
  if (!session) {
    return { ok: false as const, status: 401, error: "未认证" };
  }
  if (entity === "store" && session.user.role !== "admin") {
    return { ok: false as const, status: 403, error: "权限不足" };
  }
  if (entity === "article" && session.user.role !== "admin" && session.user.role !== "editor") {
    return { ok: false as const, status: 403, error: "权限不足" };
  }
  return { ok: true as const, userId: session.user.id };
}

// ── POST ──

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const entity = formData.get("entity");
    const entityId = formData.get("entityId");

    if (!(file instanceof File) || typeof entity !== "string" || typeof entityId !== "string") {
      return Response.json(
        { success: false, error: "参数缺失" },
        { status: 400 }
      );
    }

    const guard = await ensureUploadPermission(entity);
    if (!guard.ok) {
      return Response.json({ success: false, error: guard.error }, { status: guard.status });
    }

    // CSRF 校验
    const csrf = requireCsrf(request);
    if (!csrf.ok) return csrf.response;

    // 速率限制（上传 API 更严格：10 次/分钟 + 30 次/天/用户）
    const rl = rateLimiter.check("upload:global", 10, 60_000);
    if (!rl.ok) {
      return Response.json(
        { success: false, error: "请求过于频繁，请稍后再试", details: { retryAfter: rl.retryAfter } },
        { status: 429, headers: { "Retry-After": String(rl.retryAfter) } }
      );
    }

    // 每日限制 30 次（单用户维度）
    const rlDay = rateLimiter.check(`upload:daily:${guard.userId}`, 30, 86_400_000);
    if (!rlDay.ok) {
      return Response.json(
        { success: false, error: "今日上传次数已达上限（30次/天），请明天再试", details: { retryAfter: rlDay.retryAfter } },
        { status: 429, headers: { "Retry-After": String(rlDay.retryAfter) } }
      );
    }

    // ── 实体类型校验 ──
    if (REJECTED_ENTITIES.has(entity)) {
      return Response.json(
        { success: false, error: "City 不支持图片" },
        { status: 400 }
      );
    }
    if (!SUPPORTED_ENTITIES.has(entity)) {
      return Response.json(
        { success: false, error: "本期暂不支持该实体类型" },
        { status: 400 }
      );
    }

    // ── 文件大小校验 ──
    if (file.size > MAX_FILE_SIZE) {
      return Response.json(
        { success: false, error: "文件大小超过限制（最大 5MB）" },
        { status: 413 }
      );
    }

    // ── MIME 校验 ──
    if (!ALLOWED_MIME.has(file.type)) {
      return Response.json(
        { success: false, error: "文件类型不支持，仅允许 jpg/png/webp" },
        { status: 400 }
      );
    }

    // ── 实体存在性校验 ──
    let resolvedEntityId = entityId;
    if (entity === "store") {
      const store = await prisma.store.findFirst({
        where: { OR: [{ id: entityId }, { slug: entityId }] },
      });
      if (!store) {
        return Response.json(
          { success: false, error: "门店不存在" },
          { status: 404 }
        );
      }
      resolvedEntityId = store.id;
    } else if (entity === "article") {
      const article = await prisma.article.findUnique({ where: { id: entityId } });
      if (!article) {
        return Response.json(
          { success: false, error: "文章不存在" },
          { status: 404 }
        );
      }
    }

    // ── Buffer + sharp 元数据二次验证 ──
    const buffer = Buffer.from(await file.arrayBuffer());
    let meta;
    try {
      meta = await sharp(buffer).metadata();
    } catch {
      return Response.json(
        { success: false, error: "文件类型不支持，仅允许 jpg/png/webp" },
        { status: 400 }
      );
    }
    if (!meta.format || !["jpeg", "png", "webp"].includes(meta.format)) {
      return Response.json(
        { success: false, error: "文件类型不支持，仅允许 jpg/png/webp" },
        { status: 400 }
      );
    }

    // ── 转码为 webp（quality 80） ──
    const processed = await sharp(buffer).webp({ quality: 80 }).toBuffer();
    const processedMeta = await sharp(processed).metadata();

    // ── 写入路径 ──
    const { dir, file: fileName, rel } = buildEntityPath(entity as keyof typeof ENTITY_DIR, resolvedEntityId);
    await fs.mkdir(dir, { recursive: true });
    const finalPath = path.join(dir, fileName);
    const tmpPath = `${finalPath}.${Date.now()}.tmp`;

    // 清理旧文件（如果存在且路径不同——防御性，Store 目前路径固定）
    try {
      await fs.access(finalPath);
      await fs.unlink(finalPath);
    } catch {
      // 不存在即忽略
    }

    // 原子写入
    await fs.writeFile(tmpPath, processed);
    await fs.rename(tmpPath, finalPath);

    // ── 更新数据库 ──
    if (entity === "store") {
      await prisma.store.update({
        where: { id: resolvedEntityId },
        data: { imagePath: rel },
      });
    } else if (entity === "article") {
      await prisma.article.update({
        where: { id: resolvedEntityId },
        data: { featuredImage: rel },
      });
    }

    return Response.json(
      {
        success: true,
        data: {
          path: rel,
          size: processed.length,
          width: processedMeta.width ?? 0,
          height: processedMeta.height ?? 0,
          mime: "image/webp",
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[POST /api/upload]", error);
    return Response.json(
      { success: false, error: "服务器内部错误" },
      { status: 500 }
    );
  }
}

// ── DELETE ──

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const entity = searchParams.get("entity");
    const entityId = searchParams.get("entityId");

    if (!entity || !entityId) {
      return Response.json(
        { success: false, error: "参数缺失" },
        { status: 400 }
      );
    }

    if (REJECTED_ENTITIES.has(entity)) {
      return Response.json(
        { success: false, error: "City 不支持图片" },
        { status: 400 }
      );
    }
    if (!SUPPORTED_ENTITIES.has(entity)) {
      return Response.json(
        { success: false, error: "本期暂不支持该实体类型" },
        { status: 400 }
      );
    }

    const guard = await ensureUploadPermission(entity);
    if (!guard.ok) {
      return Response.json({ success: false, error: guard.error }, { status: guard.status });
    }

    // CSRF 校验
    const csrf = requireCsrf(request);
    if (!csrf.ok) return csrf.response;

    // 速率限制（上传 API 更严格：10 次/分钟 + 30 次/天/用户）
    const rl = rateLimiter.check("upload:global", 10, 60_000);
    if (!rl.ok) {
      return Response.json(
        { success: false, error: "请求过于频繁，请稍后再试", details: { retryAfter: rl.retryAfter } },
        { status: 429, headers: { "Retry-After": String(rl.retryAfter) } }
      );
    }

    // 每日限制 30 次（单用户维度）
    const rlDay = rateLimiter.check(`upload:daily:${guard.userId}`, 30, 86_400_000);
    if (!rlDay.ok) {
      return Response.json(
        { success: false, error: "今日上传次数已达上限（30次/天），请明天再试", details: { retryAfter: rlDay.retryAfter } },
        { status: 429, headers: { "Retry-After": String(rlDay.retryAfter) } }
      );
    }

    if (entity === "store") {
      const store = await prisma.store.findFirst({
        where: { OR: [{ id: entityId }, { slug: entityId }] },
      });
      if (!store) {
        return Response.json(
          { success: false, error: "门店不存在" },
          { status: 404 }
        );
      }

      if (!store.imagePath) {
        return Response.json(
          { success: false, error: "图片不存在" },
          { status: 404 }
        );
      }

      // 物理删除（防穿越：imagePath 必须以 /images/ 开头）
      if (store.imagePath.startsWith("/images/")) {
        const abs = path.join(process.cwd(), "public", store.imagePath.replace(/^\//, ""));
        try {
          await fs.unlink(abs);
        } catch {
          // 文件不存在也不影响 DB 清理
        }
      }

      await prisma.store.update({
        where: { id: store.id },
        data: { imagePath: null },
      });

      return Response.json({ success: true, data: { path: null } });
    }

    const article = await prisma.article.findUnique({ where: { id: entityId } });
    if (!article) {
      return Response.json(
        { success: false, error: "文章不存在" },
        { status: 404 }
      );
    }

    if (!article.featuredImage) {
      return Response.json(
        { success: false, error: "图片不存在" },
        { status: 404 }
      );
    }

    if (article.featuredImage.startsWith("/images/articles/")) {
      const abs = path.join(process.cwd(), "public", article.featuredImage.replace(/^\//, ""));
      try {
        await fs.unlink(abs);
      } catch {
        // 文件不存在也不影响 DB 清理
      }
    }

    await prisma.article.update({
      where: { id: article.id },
      data: { featuredImage: null },
    });

    return Response.json({ success: true, data: { path: null } });
  } catch (error) {
    console.error("[DELETE /api/upload]", error);
    return Response.json(
      { success: false, error: "服务器内部错误" },
      { status: 500 }
    );
  }
}
