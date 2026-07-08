import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useUnsavedChangesGuard } from "./use-unsaved-changes-guard";

describe("useUnsavedChangesGuard", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  /* ---------- beforeunload ---------- */

  it("registers beforeunload listener when dirty and not saving", () => {
    const addSpy = vi.spyOn(window, "addEventListener");
    const removeSpy = vi.spyOn(window, "removeEventListener");

    const { unmount } = renderHook(() => useUnsavedChangesGuard(true, false));

    expect(addSpy).toHaveBeenCalledWith("beforeunload", expect.any(Function));

    unmount();

    expect(removeSpy).toHaveBeenCalledWith("beforeunload", expect.any(Function));
  });

  it("does not register beforeunload listener when clean", () => {
    const addSpy = vi.spyOn(window, "addEventListener");

    renderHook(() => useUnsavedChangesGuard(false, false));

    const beforeunloadCalls = addSpy.mock.calls.filter(
      ([event]) => event === "beforeunload"
    );
    expect(beforeunloadCalls).toHaveLength(0);
  });

  it("does not register beforeunload listener when saving even if dirty", () => {
    const addSpy = vi.spyOn(window, "addEventListener");

    renderHook(() => useUnsavedChangesGuard(true, true));

    const beforeunloadCalls = addSpy.mock.calls.filter(
      ([event]) => event === "beforeunload"
    );
    expect(beforeunloadCalls).toHaveLength(0);
  });

  it("removes beforeunload listener when transitioning from dirty to clean", () => {
    const addSpy = vi.spyOn(window, "addEventListener");
    const removeSpy = vi.spyOn(window, "removeEventListener");

    const { rerender } = renderHook(
      ({ dirty, saving }: { dirty: boolean; saving: boolean }) =>
        useUnsavedChangesGuard(dirty, saving),
      { initialProps: { dirty: true, saving: false } }
    );

    expect(addSpy).toHaveBeenCalledWith("beforeunload", expect.any(Function));
    const addedHandler = addSpy.mock.calls.find(
      ([event]) => event === "beforeunload"
    )![1];

    rerender({ dirty: false, saving: false });

    expect(removeSpy).toHaveBeenCalledWith("beforeunload", addedHandler);
  });

  /* ---------- confirmLeave / dialog ---------- */

  it("opens dialog when confirmLeave is called", () => {
    const { result } = renderHook(() => useUnsavedChangesGuard(true, false));

    expect(result.current.confirmDialogProps.open).toBe(false);

    act(() => {
      result.current.confirmLeave(() => {});
    });

    expect(result.current.confirmDialogProps.open).toBe(true);
  });

  it("sets correct dialog title, description, and variant", () => {
    const { result } = renderHook(() => useUnsavedChangesGuard(true, false));

    act(() => {
      result.current.confirmLeave(() => {});
    });

    expect(result.current.confirmDialogProps.title).toBe("有未保存的修改");
    expect(result.current.confirmDialogProps.description).toContain("丢失");
    expect(result.current.confirmDialogProps.variant).toBe("danger");
    expect(result.current.confirmDialogProps.confirmLabel).toBe("离开页面");
    expect(result.current.confirmDialogProps.cancelLabel).toBe("继续编辑");
  });

  it("executes callback and closes dialog on confirm", async () => {
    const { result } = renderHook(() => useUnsavedChangesGuard(true, false));
    const callback = vi.fn();

    act(() => {
      result.current.confirmLeave(callback);
    });

    expect(result.current.confirmDialogProps.open).toBe(true);

    await act(() => result.current.confirmDialogProps.onConfirm());

    expect(callback).toHaveBeenCalledTimes(1);
    expect(result.current.confirmDialogProps.open).toBe(false);
  });

  it("clears pending callback and closes dialog on cancel", () => {
    const { result } = renderHook(() => useUnsavedChangesGuard(true, false));
    const callback = vi.fn();

    act(() => {
      result.current.confirmLeave(callback);
    });

    expect(result.current.confirmDialogProps.open).toBe(true);

    act(() => {
      result.current.confirmDialogProps.onCancel();
    });

    expect(callback).not.toHaveBeenCalled();
    expect(result.current.confirmDialogProps.open).toBe(false);
  });

  /* ---------- document click interception ---------- */

  function createAnchor(href: string, attrs?: Partial<HTMLAnchorElement>): HTMLAnchorElement {
    const a = document.createElement("a");
    a.href = href;
    if (attrs) {
      Object.entries(attrs).forEach(([key, val]) => {
        if (key === "target") {
          a.target = val as string;
        } else if (key === "download") {
          a.setAttribute("download", "");
        }
      });
    }
    document.body.appendChild(a);
    return a;
  }

  function dispatchClick(
    target: Element,
    options?: { metaKey?: boolean; ctrlKey?: boolean }
  ): MouseEvent {
    const event = new MouseEvent("click", {
      bubbles: true,
      cancelable: true,
      metaKey: options?.metaKey ?? false,
      ctrlKey: options?.ctrlKey ?? false,
    });
    act(() => {
      target.dispatchEvent(event);
    });
    return event;
  }

  it("prevents default on internal link click when dirty", () => {
    renderHook(() => useUnsavedChangesGuard(true, false));

    const link = createAnchor("/some-page");
    const event = dispatchClick(link);

    expect(event.defaultPrevented).toBe(true);

    document.body.removeChild(link);
  });

  it("does not prevent default on external link click when dirty", () => {
    renderHook(() => useUnsavedChangesGuard(true, false));

    const link = createAnchor("https://other-site.com/page");
    const event = dispatchClick(link);

    expect(event.defaultPrevented).toBe(false);

    document.body.removeChild(link);
  });

  it("does not prevent default on internal link with metaKey pressed", () => {
    renderHook(() => useUnsavedChangesGuard(true, false));

    const link = createAnchor("/some-page");
    const event = dispatchClick(link, { metaKey: true });

    expect(event.defaultPrevented).toBe(false);

    document.body.removeChild(link);
  });

  it("does not prevent default on internal link with ctrlKey pressed", () => {
    renderHook(() => useUnsavedChangesGuard(true, false));

    const link = createAnchor("/some-page");
    const event = dispatchClick(link, { ctrlKey: true });

    expect(event.defaultPrevented).toBe(false);

    document.body.removeChild(link);
  });

  it("does not prevent default on target=_blank link when dirty", () => {
    renderHook(() => useUnsavedChangesGuard(true, false));

    const link = createAnchor("/some-page", { target: "_blank" });
    const event = dispatchClick(link);

    expect(event.defaultPrevented).toBe(false);

    document.body.removeChild(link);
  });

  it("does not prevent default on hash link when dirty", () => {
    renderHook(() => useUnsavedChangesGuard(true, false));

    const link = createAnchor("#section");
    const event = dispatchClick(link);

    expect(event.defaultPrevented).toBe(false);

    document.body.removeChild(link);
  });

  it("does not prevent default on download link when dirty", () => {
    renderHook(() => useUnsavedChangesGuard(true, false));

    const link = createAnchor("/file.pdf", { download: "" } as unknown as Partial<HTMLAnchorElement>);
    const event = dispatchClick(link);

    expect(event.defaultPrevented).toBe(false);

    document.body.removeChild(link);
  });

  it("does not prevent default on internal link click when clean", () => {
    renderHook(() => useUnsavedChangesGuard(false, false));

    const link = createAnchor("/some-page");
    const event = dispatchClick(link);

    expect(event.defaultPrevented).toBe(false);

    document.body.removeChild(link);
  });
});
