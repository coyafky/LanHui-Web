import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { CurrentCopyrightYear } from "@/components/CurrentCopyrightYear";

const START = 2026;

describe("CurrentCopyrightYear", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("shows only startYear when current year equals startYear", () => {
    vi.spyOn(Date.prototype, "getFullYear").mockReturnValue(2026);
    render(<CurrentCopyrightYear startYear={START} />);
    expect(screen.getByText("2026")).toBeInTheDocument();
  });

  it("shows year range when current year > startYear", () => {
    vi.spyOn(Date.prototype, "getFullYear").mockReturnValue(2027);
    render(<CurrentCopyrightYear startYear={START} />);
    expect(screen.getByText("2026–2027")).toBeInTheDocument();
  });

  it("shows only startYear when system clock is before startYear", () => {
    vi.spyOn(Date.prototype, "getFullYear").mockReturnValue(2025);
    render(<CurrentCopyrightYear startYear={START} />);
    expect(screen.getByText("2026")).toBeInTheDocument();
  });

  it("updates year after useEffect hydration", () => {
    vi.spyOn(Date.prototype, "getFullYear").mockReturnValue(2028);
    render(<CurrentCopyrightYear startYear={START} />);
    expect(screen.getByText("2026–2028")).toBeInTheDocument();
  });
});
