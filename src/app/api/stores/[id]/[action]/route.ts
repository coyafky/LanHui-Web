import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { logActivity } from "@/lib/admin-dashboard";
import {
  ACTION_TARGET,
  canTransition,
  type StoreAction,
  type StoreStatus,
} from "@/lib/validations/store-transitions";

const VALID_ACTIONS: ReadonlySet<StoreAction> = new Set([
  "publish",
  "suspend",
  "resume",
  "terminate",
]);

function isValidAction(input: string): input is StoreAction {
  return VALID_ACTIONS.has(input as StoreAction);
}

function actionFromList(from: StoreStatus | StoreStatus[], to: StoreStatus) {
  const list = Array.isArray(from) ? from : [from];
  return list.includes(to);
}

interface ActionBody {
  statusReason?: string;
}

/**
 * 状态机动作端点：
 *   POST /api/stores/[id]/[action]
 *   action ∈ publish | suspend | resume | terminate
 *
 * 鉴权：必须 admin。
 * 二次校验：
 *   - suspend / terminate → statusReason 必填（>=1 字）
 *   - resume → phone/address/businessHours 非空
 *   - publish → level / provinceSlug / citySlug 非空
 *   - 状态转移合法性（ALLOWED_TRANSITIONS）→ 不允许 409
 */
export async function POST(
  request: NextRequest,
  ctx: { params: Promise<{ id: string; action: string }> }
) {
  try {
    const session = await auth();
    if (!session) {
      return Response.json(
        { success: false, error: "未认证" },
        { status: 401 }
      );
    }
    if (session.user.role !== "admin") {
      return Response.json(
        { success: false, error: "权限不足" },
        { status: 403 }
      );
    }

    const { id, action } = await ctx.params;
    if (!isValidAction(action)) {
      return Response.json(
        { success: false, error: "未知的状态动作" },
        { status: 400 }
      );
    }
    const target = ACTION_TARGET[action];

    const existing = await prisma.store.findFirst({
      where: { OR: [{ id }, { slug: id }] },
    });
    if (!existing) {
      return Response.json(
        { success: false, error: "门店不存在" },
        { status: 404 }
      );
    }

    const currentStatus = existing.status as StoreStatus;
    if (!actionFromList(target.from, currentStatus)) {
      return Response.json(
        {
          success: false,
          error: `当前状态「${currentStatus}」不支持「${target.label}」`,
        },
        { status: 409 }
      );
    }
    if (!canTransition(currentStatus, target.to)) {
      return Response.json(
        {
          success: false,
          error: `不允许从 ${currentStatus} 转换到 ${target.to}`,
        },
        { status: 409 }
      );
    }

    /* ---------- 解析 body（可空） ---------- */
    // 兼容测试环境（happy-dom 不设 content-length）：
    // 显式有 content-length=0 或 body 解析失败 → 视作空 body。
    let body: ActionBody = {};
    const contentLength = request.headers.get("content-length");
    if (contentLength !== "0" && contentLength !== null) {
      try {
        body = (await request.json()) as ActionBody;
      } catch {
        body = {};
      }
    } else if (contentLength === null) {
      // 没有 content-length：尝试一次解析，失败忽略（兼容 happy-dom + 生产 edge case）
      try {
        body = (await request.json()) as ActionBody;
      } catch {
        body = {};
      }
    }
    const statusReason = body.statusReason?.trim() ?? null;

    /* ---------- 业务二次校验 ---------- */
    if (
      (action === "suspend" || action === "terminate") &&
      !statusReason
    ) {
      return Response.json(
        {
          success: false,
          error: "参数验证失败",
          details: { statusReason: ["暂停/终止合作必须填写原因"] },
        },
        { status: 400 }
      );
    }

    if (action === "resume") {
      if (
        !existing.phone?.trim() ||
        !existing.address?.trim() ||
        !existing.businessHours?.trim()
      ) {
        return Response.json(
          {
            success: false,
            error: "恢复营业前请重新核对联系方式、地址和营业时间",
          },
          { status: 400 }
        );
      }
    }

    if (action === "publish") {
      if (!existing.level) {
        return Response.json(
          { success: false, error: "发布前请先设置门店等级" },
          { status: 400 }
        );
      }
      if (!existing.provinceSlug || !existing.citySlug) {
        return Response.json(
          { success: false, error: "发布前请完善省份与城市" },
          { status: 400 }
        );
      }
    }

    /* ---------- 写库（双写 status + isActive） ---------- */
    const store = await prisma.store.update({
      where: { id: existing.id },
      data: {
        status: target.to,
        isActive: target.to === "active",
        statusChangedAt: new Date(),
        statusChangedBy: session.user.id,
        statusReason,
      },
    });

    await logActivity({
      actorId: session.user.id,
      action: `store.${action}`,
      entity: "store",
      entityId: store.id,
      metadata: {
        from: currentStatus,
        to: target.to,
        name: store.name,
        slug: store.slug,
        statusReason,
      },
    });

    return Response.json({ success: true, data: store });
  } catch (error) {
    // 标准化 Prisma 7 + Driver Adapter P2002 / P2022 等
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      (error as { code?: string }).code === "P2022"
    ) {
      return Response.json(
        {
          success: false,
          error: "数据库字段缺失",
          details: { _form: ["请检查数据库迁移是否完整"] },
        },
        { status: 500 }
      );
    }
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      (error as { code?: string }).code === "P2002"
    ) {
      return Response.json(
        {
          success: false,
          error: "数据已存在",
          details: { _form: ["记录重复"] },
        },
        { status: 409 }
      );
    }
    console.error("[POST /api/stores/[id]/[action]]", error);
    return Response.json(
      { success: false, error: "服务器内部错误" },
      { status: 500 }
    );
  }
}
