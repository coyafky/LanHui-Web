import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup, act } from "@testing-library/react";

const mockPush = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

vi.mock("lucide-react", () => ({
  Search: () => <svg data-testid="search-icon" />,
  X: () => <svg data-testid="x-icon" />,
  SearchX: () => <svg data-testid="searchx-icon" />,
}));

import { StoreSearch } from "./StoreSearch";

// ---------------------------------------------------------------------------
// Test data
// ---------------------------------------------------------------------------

const MOCK_STORES = [
  {
    id: "1",
    name: "蓝辉轻改顺德大良店",
    provinceLabel: "广东省",
    cityLabel: "佛山市",
    district: "顺德区",
    address: "大良街道xxx",
    level: "flagship",
  },
  {
    id: "2",
    name: "蓝辉轻改广州天河店",
    provinceLabel: "广东省",
    cityLabel: "广州市",
    district: "天河区",
    address: "天河路xxx",
    level: "premium",
  },
  {
    id: "3",
    name: "蓝辉轻改南京江宁店",
    provinceLabel: "江苏省",
    cityLabel: "南京市",
    district: "江宁区",
    address: "双龙大道xxx",
    level: "flagship",
  },
];

const MOCK_SIX_STORES = Array.from({ length: 6 }, (_, i) => ({
  id: String(i + 1),
  name: `蓝辉轻改门店${i + 1}`,
  provinceLabel: "广东省",
  cityLabel: "佛山市",
  district: "",
  address: `地址${i + 1}`,
  level: "",
}));

const MOCK_SEVEN_STORES = [
  ...MOCK_SIX_STORES,
  {
    id: "7",
    name: "蓝辉轻改深圳店",
    provinceLabel: "广东省",
    cityLabel: "深圳市",
    district: "",
    address: "科技园路xxx",
    level: "flagship",
  },
];

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------

beforeEach(() => {
  mockPush.mockReset();
});

afterEach(() => {
  cleanup();
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("StoreSearch", () => {
  // ─── Group 1 — Basic render ───────────────────────────────────────────────

  describe("basic render", () => {
    it("renders search input with placeholder", () => {
      render(<StoreSearch stores={MOCK_STORES} />);
      const input = screen.getByPlaceholderText(/输入省份.*搜索/);
      expect(input).toBeInTheDocument();
      expect(input.tagName).toBe("INPUT");
    });

    it("hides clear button when input is empty", () => {
      render(<StoreSearch stores={MOCK_STORES} />);
      expect(screen.queryByRole("button", { name: /清空/ })).toBeNull();
    });

    it("shows clear button when keyword is present", () => {
      render(<StoreSearch stores={MOCK_STORES} />);
      const input = screen.getByRole("combobox");
      fireEvent.change(input, { target: { value: "顺德" } });
      expect(screen.getByRole("button", { name: /清空/ })).toBeInTheDocument();
    });

    it("has combobox role with aria-expanded=false", () => {
      render(<StoreSearch stores={MOCK_STORES} />);
      const input = screen.getByRole("combobox");
      expect(input).toHaveAttribute("aria-expanded", "false");
    });
  });

  // ─── Group 2 — Client-side filtering ──────────────────────────────────────

  describe("client-side filtering", () => {
    it("filters stores locally by name", () => {
      render(<StoreSearch stores={MOCK_STORES} />);
      const input = screen.getByRole("combobox");
      fireEvent.change(input, { target: { value: "顺德" } });

      expect(screen.getByText("蓝辉轻改顺德大良店")).toBeInTheDocument();
      expect(screen.queryByText("蓝辉轻改广州天河店")).not.toBeInTheDocument();
    });

    it("filters stores by city", () => {
      render(<StoreSearch stores={MOCK_STORES} />);
      const input = screen.getByRole("combobox");
      fireEvent.change(input, { target: { value: "广州" } });

      expect(screen.getByText("蓝辉轻改广州天河店")).toBeInTheDocument();
      expect(screen.queryByText("蓝辉轻改顺德大良店")).not.toBeInTheDocument();
    });

    it("filters stores by province", () => {
      render(<StoreSearch stores={MOCK_STORES} />);
      const input = screen.getByRole("combobox");
      fireEvent.change(input, { target: { value: "江苏" } });

      expect(screen.getByText("蓝辉轻改南京江宁店")).toBeInTheDocument();
    });

    it("filters stores by district", () => {
      render(<StoreSearch stores={MOCK_STORES} />);
      const input = screen.getByRole("combobox");
      fireEvent.change(input, { target: { value: "顺德区" } });

      expect(screen.getByText("蓝辉轻改顺德大良店")).toBeInTheDocument();
    });

    it("shows empty state when no matches", () => {
      render(<StoreSearch stores={MOCK_STORES} />);
      const input = screen.getByRole("combobox");
      fireEvent.change(input, { target: { value: "zzz-no-match" } });

      expect(screen.getByText("未找到匹配门店")).toBeInTheDocument();
    });

    it("limits results to 6", () => {
      render(<StoreSearch stores={MOCK_SEVEN_STORES} />);
      const input = screen.getByRole("combobox");
      fireEvent.change(input, { target: { value: "蓝辉" } });

      const options = screen.getAllByRole("option");
      expect(options).toHaveLength(6);
    });

    it("closes dropdown when input cleared", () => {
      render(<StoreSearch stores={MOCK_STORES} />);
      const input = screen.getByRole("combobox");
      fireEvent.change(input, { target: { value: "顺德" } });
      expect(screen.getByRole("listbox")).toBeInTheDocument();

      fireEvent.change(input, { target: { value: "" } });
      expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    });
  });

  // ─── Group 3 — Click outside ──────────────────────────────────────────────

  describe("click outside", () => {
    it("clicking outside closes the dropdown", () => {
      render(<StoreSearch stores={MOCK_STORES} />);
      const input = screen.getByRole("combobox");

      fireEvent.change(input, { target: { value: "顺德" } });
      expect(screen.getByText("蓝辉轻改顺德大良店")).toBeInTheDocument();

      fireEvent.mouseDown(document.body);
      expect(screen.queryByText("蓝辉轻改顺德大良店")).not.toBeInTheDocument();
    });
  });

  // ─── Group 4 — Keyboard navigation ────────────────────────────────────────

  describe("keyboard navigation", () => {
    it("ArrowDown highlights first then second item", () => {
      render(<StoreSearch stores={MOCK_STORES} />);
      const input = screen.getByRole("combobox");
      fireEvent.change(input, { target: { value: "蓝辉" } });

      fireEvent.keyDown(input, { key: "ArrowDown" });
      const firstOption = screen.getByRole("option", { name: /蓝辉轻改顺德大良店/ });
      expect(firstOption).toHaveAttribute("aria-selected", "true");

      fireEvent.keyDown(input, { key: "ArrowDown" });
      const secondOption = screen.getByRole("option", { name: /蓝辉轻改广州天河店/ });
      expect(secondOption).toHaveAttribute("aria-selected", "true");
    });

    it("ArrowUp from first item wraps to last", () => {
      render(<StoreSearch stores={MOCK_STORES} />);
      const input = screen.getByRole("combobox");
      fireEvent.change(input, { target: { value: "蓝辉" } });

      fireEvent.keyDown(input, { key: "ArrowUp" });
      const lastOption = screen.getByRole("option", { name: /蓝辉轻改南京江宁店/ });
      expect(lastOption).toHaveAttribute("aria-selected", "true");
    });

    it("Enter with highlighted item navigates to store detail", () => {
      render(<StoreSearch stores={MOCK_STORES} />);
      const input = screen.getByRole("combobox");
      fireEvent.change(input, { target: { value: "顺德" } });

      fireEvent.keyDown(input, { key: "ArrowDown" });
      fireEvent.keyDown(input, { key: "Enter" });

      expect(mockPush).toHaveBeenCalledWith("/agent/store/1");
    });

    it("Enter without highlight selects first result", () => {
      render(<StoreSearch stores={MOCK_STORES} />);
      const input = screen.getByRole("combobox");
      fireEvent.change(input, { target: { value: "顺德" } });

      // No arrow key — just Enter
      fireEvent.keyDown(input, { key: "Enter" });

      expect(mockPush).toHaveBeenCalledWith("/agent/store/1");
    });

    it("Escape closes the dropdown", () => {
      render(<StoreSearch stores={MOCK_STORES} />);
      const input = screen.getByRole("combobox");
      fireEvent.change(input, { target: { value: "顺德" } });

      fireEvent.keyDown(input, { key: "Escape" });
      expect(screen.queryByText("蓝辉轻改顺德大良店")).not.toBeInTheDocument();
    });
  });

  // ─── Group 5 — Behaviors and edge cases ───────────────────────────────────

  describe("behaviors and edge cases", () => {
    it("clear button navigates to /agent", () => {
      render(<StoreSearch stores={MOCK_STORES} />);
      const input = screen.getByRole("combobox");
      fireEvent.change(input, { target: { value: "佛山" } });
      const clearBtn = screen.getByRole("button", { name: /清空/ });
      fireEvent.click(clearBtn);
      expect(mockPush).toHaveBeenCalledWith("/agent");
    });

    it("empty input + Enter does not navigate", () => {
      render(<StoreSearch stores={MOCK_STORES} />);
      const input = screen.getByRole("combobox");
      fireEvent.keyDown(input, { key: "Enter" });
      expect(mockPush).not.toHaveBeenCalled();
    });

    it("IME composition defers filtering until after compositionend", () => {
      render(<StoreSearch stores={MOCK_STORES} />);
      const input = screen.getByRole("combobox");

      fireEvent.compositionStart(input);
      fireEvent.change(input, { target: { value: "顺德" } });

      // During IME composition, dropdown should not appear
      expect(screen.queryByRole("listbox")).not.toBeInTheDocument();

      fireEvent.compositionEnd(input);

      // After composition end, dropdown should appear
      expect(screen.getByRole("listbox")).toBeInTheDocument();
    });

    it("clicking suggestion navigates to store detail", () => {
      render(<StoreSearch stores={MOCK_STORES} />);
      const input = screen.getByRole("combobox");

      fireEvent.change(input, { target: { value: "顺德" } });
      expect(screen.getByText("蓝辉轻改顺德大良店")).toBeInTheDocument();

      fireEvent.click(screen.getByText("蓝辉轻改顺德大良店"));
      expect(mockPush).toHaveBeenCalledWith("/agent/store/1");
    });
  });

  // ─── Group 6 — Overflow / multiple suggestions ────────────────────────────

  describe("overflow / multiple suggestions", () => {
    it("renders all 6 suggestions when stores match", () => {
      render(<StoreSearch stores={MOCK_SEVEN_STORES} />);
      const input = screen.getByRole("combobox");

      fireEvent.change(input, { target: { value: "蓝辉" } });

      expect(screen.getByText("蓝辉轻改门店1")).toBeInTheDocument();
      expect(screen.getByText("蓝辉轻改门店6")).toBeInTheDocument();

      const options = screen.getAllByRole("option");
      expect(options).toHaveLength(6);
    });

    it("ArrowDown reaches the last of 6 suggestions", () => {
      render(<StoreSearch stores={MOCK_SIX_STORES} />);
      const input = screen.getByRole("combobox");

      fireEvent.change(input, { target: { value: "蓝辉" } });
      expect(screen.getByText("蓝辉轻改门店6")).toBeInTheDocument();

      for (let i = 0; i < 6; i++) {
        fireEvent.keyDown(input, { key: "ArrowDown" });
      }

      const lastOption = screen.getByRole("option", { name: /蓝辉轻改门店6/ });
      expect(lastOption).toHaveAttribute("aria-selected", "true");
    });

    it("clicking the 5th suggestion navigates to its store detail", () => {
      render(<StoreSearch stores={MOCK_SIX_STORES} />);
      const input = screen.getByRole("combobox");

      fireEvent.change(input, { target: { value: "蓝辉" } });
      expect(screen.getByText("蓝辉轻改门店5")).toBeInTheDocument();

      fireEvent.click(screen.getByText("蓝辉轻改门店5"));
      expect(mockPush).toHaveBeenCalledWith("/agent/store/5");
    });

    it("dropdown has scrollable overflow class", () => {
      render(<StoreSearch stores={MOCK_SIX_STORES} />);
      const input = screen.getByRole("combobox");

      fireEvent.change(input, { target: { value: "蓝辉" } });

      const listbox = screen.getByRole("listbox");
      expect(listbox.className).toContain("overflow-y-auto");
    });
  });
});
