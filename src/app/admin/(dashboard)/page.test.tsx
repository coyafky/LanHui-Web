import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import type { Session } from "next-auth";

/**
 * Admin Dashboard V2 page tests (T10 stage 3)
 *
 * 策略：
 * - Mock @/lib/auth 返回可控 session
 * - Mock @/lib/admin-dashboard.getDashboardSummaryV2 返回固定 DashboardSummaryV2
 * - Mock 所有 9 个 Dashboard* 组件，让它们各渲染一个 data-testid 占位元素
 *   以便断言组件确实被渲染。
 */

// ---------- Mockable handle holders ----------
const mockAuth = vi.hoisted(() => vi.fn());
const mockGetDashboardSummaryV2 = vi.hoisted(() => vi.fn());

vi.mock("@/lib/auth", () => ({
  auth: mockAuth,
}));

vi.mock("@/lib/admin-dashboard", () => ({
  getDashboardSummaryV2: mockGetDashboardSummaryV2,
}));

// Mock all 9 dashboard components to render an identifiable placeholder.
vi.mock("@/components/admin/DashboardWelcome", () => ({
  DashboardWelcome: ({ userName }: { userName: string }) => (
    <div data-testid="DashboardWelcome" data-username={userName} />
  ),
}));

vi.mock("@/components/admin/DashboardTodoList", () => ({
  DashboardTodoList: () => <div data-testid="DashboardTodoList" />,
}));

vi.mock("@/components/admin/DashboardKpiCards", () => ({
  DashboardKpiCards: () => <div data-testid="DashboardKpiCards" />,
}));

vi.mock("@/components/admin/DashboardStoreNetwork", () => ({
  DashboardStoreNetwork: () => <div data-testid="DashboardStoreNetwork" />,
}));

vi.mock("@/components/admin/DashboardContentHealth", () => ({
  DashboardContentHealth: () => <div data-testid="DashboardContentHealth" />,
}));

vi.mock("@/components/admin/DashboardInterestPanel", () => ({
  DashboardInterestPanel: () => <div data-testid="DashboardInterestPanel" />,
}));

vi.mock("@/components/admin/DashboardTrendChart", () => ({
  DashboardTrendChart: () => <div data-testid="DashboardTrendChart" />,
}));

vi.mock("@/components/admin/DashboardRecentActivity", () => ({
  // 记录收到的 role 以便断言
  DashboardRecentActivity: ({
    role,
  }: {
    role: "admin" | "editor" | undefined;
  }) => <div data-testid="DashboardRecentActivity" data-role={role ?? ""} />,
}));

vi.mock("@/components/admin/DashboardQuickActions", () => ({
  DashboardQuickActions: () => <div data-testid="DashboardQuickActions" />,
}));

// ---------- Test fixtures ----------
function buildSummaryV2(overrides?: {
  welcome?: Record<string, unknown> | null;
  todoSummary?: Record<string, unknown> | null;
  kpi?: Record<string, unknown> | null;
  storeSummary?: Record<string, unknown> | null;
  contentSummary?: Record<string, unknown> | null;
  interestSummary?: Record<string, unknown> | null;
  recentActivity?: Record<string, unknown> | null;
  quickActions?: Array<Record<string, unknown>>;
}): Record<string, unknown> {
  return {
    welcome: overrides?.welcome ?? {
      userName: "Default",
      today: "2026-06-25",
      summaryText: "运营正常",
      severity: "ok",
    },
    todoSummary: overrides?.todoSummary ?? { items: [], totalCount: 0 },
    kpi: overrides?.kpi ?? {
      activeStores: 1,
      publishedArticles: 1,
      monthlyPageViews: 1,
      monthlyContactIntent: 1,
    },
    storeSummary: overrides?.storeSummary ?? { byStatus: [], topProvinces: [], byLevel: [], missingProfile: 0 },
    contentSummary: overrides?.contentSummary ?? { byStatus: [], recent7dPublished: 0, topCategories: [], missingCover: 0 },
    interestSummary: overrides?.interestSummary ?? {
      dailyTrend30d: [],
      topProductInterest: [],
      topTopicInterest: [],
      topStoreViews: [],
      contactTrend30d: [],
      zeroReason: null,
    },
    recentActivity: overrides?.recentActivity ?? { items: [] },
    quickActions: overrides?.quickActions ?? [],
    fetchedAt: new Date().toISOString(),
  };
}

const ADMIN_SESSION: Session = {
  user: { id: "u-test-admin", name: "Coya", email: "coya@lanhui.com", role: "admin" },
  expires: "2099-01-01",
};
const EDITOR_SESSION: Session = {
  user: { id: "u-test-editor", name: "Editor", email: "editor@lanhui.com", role: "editor" },
  expires: "2099-01-01",
};

// 所有 9 个 dashboard 组件 testid（按 page.tsx 中的渲染顺序）
const ORDERED_TESTIDS = [
  "DashboardWelcome",
  "DashboardTodoList",
  "DashboardKpiCards",
  "DashboardStoreNetwork",
  "DashboardContentHealth",
  "DashboardInterestPanel",
  "DashboardTrendChart",
  "DashboardRecentActivity",
  "DashboardQuickActions",
];

beforeEach(() => {
  mockAuth.mockReset();
  mockGetDashboardSummaryV2.mockReset();
});

afterEach(() => {
  cleanup();
});

describe("DashboardPage", () => {
  it("admin role：渲染所有 9 个组件占位, 顺序正确, userName 来自 session", async () => {
    mockAuth.mockResolvedValueOnce(ADMIN_SESSION);
    mockGetDashboardSummaryV2.mockResolvedValueOnce(buildSummaryV2());

    const DashboardPage = (await import("./page")).default;
    const element = await DashboardPage();
    render(element);

    for (const testid of ORDERED_TESTIDS) {
      expect(screen.getByTestId(testid)).toBeInTheDocument();
    }

    // DOM 顺序断言：getAllByTestId 返回数组按文档顺序排列
    const allNodes = ORDERED_TESTIDS.map((t) => screen.getByTestId(t));
    const positions = allNodes.map((n) =>
      Array.from(document.body.querySelectorAll("[data-testid]")).indexOf(n),
    );
    const sortedAsc = [...positions].sort((a, b) => a - b);
    expect(positions).toEqual(sortedAsc);

    // userName 来自 session.user.name
    expect(screen.getByTestId("DashboardWelcome").getAttribute("data-username")).toBe("Coya");

    // RecentActivity 收到 role=admin
    expect(screen.getByTestId("DashboardRecentActivity").getAttribute("data-role")).toBe("admin");
  });

  it("editor role：所有 9 个组件仍渲染, RecentActivity 收到 role=editor", async () => {
    mockAuth.mockResolvedValueOnce(EDITOR_SESSION);
    mockGetDashboardSummaryV2.mockResolvedValueOnce(buildSummaryV2());

    const DashboardPage = (await import("./page")).default;
    const element = await DashboardPage();
    render(element);

    for (const testid of ORDERED_TESTIDS) {
      expect(screen.getByTestId(testid)).toBeInTheDocument();
    }

    expect(screen.getByTestId("DashboardWelcome").getAttribute("data-username")).toBe("Editor");
    expect(screen.getByTestId("DashboardRecentActivity").getAttribute("data-role")).toBe("editor");
  });

  it("null session：仍能渲染（防御性 fallback），userName 退化为 '用户'", async () => {
    mockAuth.mockResolvedValueOnce(null);
    mockGetDashboardSummaryV2.mockResolvedValueOnce(buildSummaryV2());

    const DashboardPage = (await import("./page")).default;
    const element = await DashboardPage();
    render(element);

    for (const testid of ORDERED_TESTIDS) {
      expect(screen.getByTestId(testid)).toBeInTheDocument();
    }

    // userName 退化
    expect(screen.getByTestId("DashboardWelcome").getAttribute("data-username")).toBe("用户");
  });

  it("所有 summary 字段为 null 时：仍能渲染, 不崩溃（graceful degradation）", async () => {
    mockAuth.mockResolvedValueOnce(ADMIN_SESSION);
    mockGetDashboardSummaryV2.mockResolvedValueOnce(buildSummaryV2({
      welcome: null,
      todoSummary: null,
      kpi: null,
      storeSummary: null,
      contentSummary: null,
      interestSummary: null,
      recentActivity: null,
      quickActions: [],
    }));

    const DashboardPage = (await import("./page")).default;
    const element = await DashboardPage();
    render(element);

    for (const testid of ORDERED_TESTIDS) {
      expect(screen.getByTestId(testid)).toBeInTheDocument();
    }

    // userName 仍能 fallback（welcome=null 时使用 session.user.name）
    expect(screen.getByTestId("DashboardWelcome").getAttribute("data-username")).toBe("Coya");
  });
});
