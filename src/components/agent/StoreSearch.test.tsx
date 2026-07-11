import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup, waitFor, act } from "@testing-library/react";

const mockPush = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

vi.mock("lucide-react", () => ({
  Search: () => <svg data-testid="search-icon" />,
  X: () => <svg data-testid="x-icon" />,
  Loader2: () => <svg data-testid="loader-icon" />,
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
    level: "旗舰店",
  },
  {
    id: "2",
    name: "蓝辉轻改广州天河店",
    provinceLabel: "广东省",
    cityLabel: "广州市",
    district: "天河区",
    address: "天河路xxx",
    level: "高级店",
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

function mockFetchSuccess(data = MOCK_STORES) {
  return vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
    new Response(JSON.stringify({ success: true, data }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }),
  );
}

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------

beforeEach(() => {
  mockPush.mockReset();
  vi.useFakeTimers({ shouldAdvanceTime: true });
});

afterEach(() => {
  vi.useRealTimers();
  cleanup();
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("StoreSearch", () => {
  // ─── Group 1 — Basic render ───────────────────────────────────────────────

  describe("basic render", () => {
    it("renders search input with placeholder", () => {
      render(<StoreSearch />);
      const input = screen.getByPlaceholderText(/输入省份.*搜索/);
      expect(input).toBeInTheDocument();
      expect(input.tagName).toBe("INPUT");
    });

    it("uses initialKeyword as default value", () => {
      render(<StoreSearch initialKeyword="佛山" />);
      const input = screen.getByPlaceholderText(/输入省份.*搜索/) as HTMLInputElement;
      expect(input.value).toBe("佛山");
    });

    it("hides clear button when input is empty", () => {
      render(<StoreSearch />);
      expect(screen.queryByRole("button", { name: /清空/ })).toBeNull();
    });

    it("shows clear button when keyword is present", () => {
      render(<StoreSearch initialKeyword="佛山" />);
      expect(screen.getByRole("button", { name: /清空/ })).toBeInTheDocument();
    });

    it("has combobox role with aria-expanded=false", () => {
      render(<StoreSearch />);
      const input = screen.getByRole("combobox");
      expect(input).toHaveAttribute("aria-expanded", "false");
    });
  });

  // ─── Group 2 — Debounce + fetch ───────────────────────────────────────────

  describe("debounce + fetch", () => {
    it("types text and fetch is called after debounce window", async () => {
      const fetchSpy = mockFetchSuccess();

      render(<StoreSearch />);
      const input = screen.getByRole("combobox");

      fireEvent.change(input, { target: { value: "顺德" } });

      // Before debounce window — fetch should NOT have been called
      expect(fetchSpy).not.toHaveBeenCalled();

      // Advance past the 200ms debounce
      await act(async () => {
        vi.advanceTimersByTime(200);
      });

      await waitFor(() => {
        expect(fetchSpy).toHaveBeenCalledTimes(1);
      });
      expect(fetchSpy).toHaveBeenCalledWith(
        expect.stringContaining("/api/stores?search=%E9%A1%BA%E5%BE%B7&limit=6&sort=public_featured"),
        expect.anything(),
      );
    });

    it("fetch success renders suggestion items", async () => {
      mockFetchSuccess();

      render(<StoreSearch />);
      const input = screen.getByRole("combobox");

      fireEvent.change(input, { target: { value: "顺德" } });
      await act(async () => {
        vi.advanceTimersByTime(200);
      });

      await waitFor(() => {
        expect(screen.getByText("蓝辉轻改顺德大良店")).toBeInTheDocument();
      });
      expect(screen.getByText("广东省 · 佛山市")).toBeInTheDocument();
      expect(screen.getByText("蓝辉轻改广州天河店")).toBeInTheDocument();
    });

    it("empty fetch result shows '未找到匹配门店'", async () => {
      vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
        new Response(JSON.stringify({ success: true, data: [] }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      );

      render(<StoreSearch />);
      const input = screen.getByRole("combobox");

      fireEvent.change(input, { target: { value: "顺德" } });
      await act(async () => {
        vi.advanceTimersByTime(200);
      });

      await waitFor(() => {
        expect(screen.getByText("未找到匹配门店")).toBeInTheDocument();
      });
    });

    it("loading state shows '搜索中...' while fetch is pending", async () => {
      // Never-resolving promise so fetch stays in loading state
      vi.spyOn(globalThis, "fetch").mockReturnValueOnce(new Promise(() => {}));

      render(<StoreSearch />);
      const input = screen.getByRole("combobox");

      fireEvent.change(input, { target: { value: "顺德" } });
      await act(async () => {
        vi.advanceTimersByTime(200);
      });

      await waitFor(() => {
        expect(screen.getByText("搜索中...")).toBeInTheDocument();
      });
    });

    it("rapid typing only triggers one fetch", async () => {
      const fetchSpy = mockFetchSuccess();

      render(<StoreSearch />);
      const input = screen.getByRole("combobox");

      // Rapidly change value within debounce window
      fireEvent.change(input, { target: { value: "顺" } });
      fireEvent.change(input, { target: { value: "顺德" } });
      fireEvent.change(input, { target: { value: "顺德大" } });

      // Advance past debounce window
      await act(async () => {
        vi.advanceTimersByTime(200);
      });

      await waitFor(() => {
        // Should only fetch once (the final value)
        expect(fetchSpy).toHaveBeenCalledTimes(1);
      });
      expect(fetchSpy).toHaveBeenCalledWith(
        expect.stringContaining("search=%E9%A1%BA%E5%BE%B7%E5%A4%A7"),
        expect.anything(),
      );
    });
  });

  // ─── Group 3 — Click outside ──────────────────────────────────────────────

  describe("click outside", () => {
    it("clicking outside closes the dropdown", async () => {
      mockFetchSuccess();

      render(<StoreSearch />);
      const input = screen.getByRole("combobox");

      fireEvent.change(input, { target: { value: "顺德" } });
      await act(async () => {
        vi.advanceTimersByTime(200);
      });

      // Wait for suggestions to appear
      await waitFor(() => {
        expect(screen.getByText("蓝辉轻改顺德大良店")).toBeInTheDocument();
      });

      // Click outside
      fireEvent.mouseDown(document.body);

      // Suggestions should be gone
      expect(screen.queryByText("蓝辉轻改顺德大良店")).not.toBeInTheDocument();
    });
  });

  // ─── Group 4 — Keyboard navigation ────────────────────────────────────────

  describe("keyboard navigation", () => {
    async function openDropdown() {
      mockFetchSuccess();
      render(<StoreSearch />);
      const input = screen.getByRole("combobox");
      fireEvent.change(input, { target: { value: "顺德" } });
      await act(async () => {
        vi.advanceTimersByTime(200);
      });
      await waitFor(() => {
        expect(screen.getByText("蓝辉轻改顺德大良店")).toBeInTheDocument();
      });
      return input;
    }

    it("ArrowDown highlights first then second item", async () => {
      const input = await openDropdown();

      // First ArrowDown → highlight first item
      fireEvent.keyDown(input, { key: "ArrowDown" });

      const firstOption = screen.getByRole("option", { name: /蓝辉轻改顺德大良店/ });
      expect(firstOption).toHaveAttribute("aria-selected", "true");

      // Second ArrowDown → highlight second item
      fireEvent.keyDown(input, { key: "ArrowDown" });

      const secondOption = screen.getByRole("option", { name: /蓝辉轻改广州天河店/ });
      expect(secondOption).toHaveAttribute("aria-selected", "true");
      // First should no longer be selected
      expect(screen.getByRole("option", { name: /蓝辉轻改顺德大良店/ })).toHaveAttribute(
        "aria-selected",
        "false",
      );
    });

    it("ArrowUp from first item wraps to last", async () => {
      const input = await openDropdown();

      // ArrowUp from initial state (highlightIndex=-1) should wrap to last
      fireEvent.keyDown(input, { key: "ArrowUp" });

      const lastOption = screen.getByRole("option", { name: /蓝辉轻改广州天河店/ });
      expect(lastOption).toHaveAttribute("aria-selected", "true");
    });

    it("Enter with highlighted item navigates to store detail", async () => {
      const input = await openDropdown();

      // Highlight first item
      fireEvent.keyDown(input, { key: "ArrowDown" });

      // Press Enter
      fireEvent.keyDown(input, { key: "Enter" });

      expect(mockPush).toHaveBeenCalledWith("/agent/store/1");
    });

    it("Enter without highlight navigates to search page", async () => {
      mockFetchSuccess();
      render(<StoreSearch />);
      const input = screen.getByRole("combobox");

      fireEvent.change(input, { target: { value: "佛山" } });
      await act(async () => {
        vi.advanceTimersByTime(200);
      });

      // Wait for dropdown to open
      await waitFor(() => {
        expect(screen.getByRole("listbox")).toBeInTheDocument();
      });

      // Press Enter without highlighting any item
      fireEvent.keyDown(input, { key: "Enter" });

      expect(mockPush).toHaveBeenCalledWith("/agent?q=%E4%BD%9B%E5%B1%B1");
    });

    it("Escape closes the dropdown", async () => {
      const input = await openDropdown();

      // Press Escape
      fireEvent.keyDown(input, { key: "Escape" });

      // Dropdown should be closed
      expect(screen.queryByText("蓝辉轻改顺德大良店")).not.toBeInTheDocument();
      expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    });
  });

  // ─── Group 5 — Behaviors and edge cases ───────────────────────────────────

  describe("behaviors and edge cases", () => {
    it("clear button navigates to /agent", () => {
      render(<StoreSearch initialKeyword="佛山" />);
      const clearBtn = screen.getByRole("button", { name: /清空/ });
      fireEvent.click(clearBtn);
      expect(mockPush).toHaveBeenCalledWith("/agent");
    });

    it("empty input + Enter does not navigate", () => {
      render(<StoreSearch />);
      const input = screen.getByRole("combobox");
      fireEvent.keyDown(input, { key: "Enter" });
      expect(mockPush).not.toHaveBeenCalled();
    });

    it("IME composition defers fetch until after compositionend", async () => {
      const fetchSpy = mockFetchSuccess();

      render(<StoreSearch />);
      const input = screen.getByRole("combobox");

      // Start IME composition
      fireEvent.compositionStart(input);

      // Type during composition
      fireEvent.change(input, { target: { value: "顺" } });
      fireEvent.change(input, { target: { value: "顺德" } });

      // Advance past debounce window — fetch should NOT be called
      await act(async () => {
        vi.advanceTimersByTime(200);
      });

      // Wait a tick for any pending microtasks
      await Promise.resolve();

      expect(fetchSpy).not.toHaveBeenCalled();

      // End composition
      fireEvent.compositionEnd(input);

      // Advance past debounce window again — fetch SHOULD be called now
      await act(async () => {
        vi.advanceTimersByTime(200);
      });

      await waitFor(() => {
        expect(fetchSpy).toHaveBeenCalledTimes(1);
      });
    });

    it("clicking suggestion navigates to store detail", async () => {
      mockFetchSuccess();

      render(<StoreSearch />);
      const input = screen.getByRole("combobox");

      fireEvent.change(input, { target: { value: "顺德" } });
      await act(async () => {
        vi.advanceTimersByTime(200);
      });

      await waitFor(() => {
        expect(screen.getByText("蓝辉轻改顺德大良店")).toBeInTheDocument();
      });

      // Click the suggestion text
      fireEvent.click(screen.getByText("蓝辉轻改顺德大良店"));

      expect(mockPush).toHaveBeenCalledWith("/agent/store/1");
    });
  });

  // ─── Group 6 — Overflow / multiple suggestions ────────────────────────────

  describe("overflow / multiple suggestions", () => {
    it("renders all 6 suggestions when API returns 6 stores", async () => {
      mockFetchSuccess(MOCK_SIX_STORES);

      render(<StoreSearch />);
      const input = screen.getByRole("combobox");

      fireEvent.change(input, { target: { value: "佛山" } });
      await act(async () => {
        vi.advanceTimersByTime(200);
      });

      await waitFor(() => {
        expect(screen.getByText("蓝辉轻改门店1")).toBeInTheDocument();
        expect(screen.getByText("蓝辉轻改门店6")).toBeInTheDocument();
      });

      const options = screen.getAllByRole("option");
      expect(options).toHaveLength(6);
    });

    it("ArrowDown reaches the last of 6 suggestions", async () => {
      mockFetchSuccess(MOCK_SIX_STORES);

      render(<StoreSearch />);
      const input = screen.getByRole("combobox");

      fireEvent.change(input, { target: { value: "佛山" } });
      await act(async () => {
        vi.advanceTimersByTime(200);
      });

      await waitFor(() => {
        expect(screen.getByText("蓝辉轻改门店6")).toBeInTheDocument();
      });

      for (let i = 0; i < 6; i++) {
        fireEvent.keyDown(input, { key: "ArrowDown" });
      }

      const lastOption = screen.getByRole("option", { name: /蓝辉轻改门店6/ });
      expect(lastOption).toHaveAttribute("aria-selected", "true");
    });

    it("clicking the 5th suggestion navigates to its store detail", async () => {
      mockFetchSuccess(MOCK_SIX_STORES);

      render(<StoreSearch />);
      const input = screen.getByRole("combobox");

      fireEvent.change(input, { target: { value: "佛山" } });
      await act(async () => {
        vi.advanceTimersByTime(200);
      });

      await waitFor(() => {
        expect(screen.getByText("蓝辉轻改门店5")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText("蓝辉轻改门店5"));
      expect(mockPush).toHaveBeenCalledWith("/agent/store/5");
    });

    it("dropdown has scrollable overflow class", async () => {
      mockFetchSuccess(MOCK_SIX_STORES);

      render(<StoreSearch />);
      const input = screen.getByRole("combobox");

      fireEvent.change(input, { target: { value: "佛山" } });
      await act(async () => {
        vi.advanceTimersByTime(200);
      });

      await waitFor(() => {
        const listbox = screen.getByRole("listbox");
        expect(listbox.className).toContain("overflow-y-auto");
      });
    });
  });
});
