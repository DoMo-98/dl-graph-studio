import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useEditorToast } from "./useEditorToast";

afterEach(() => {
  vi.useRealTimers();
});

describe("useEditorToast", () => {
  it("shows one toast and replaces the previous toast", () => {
    const { result } = renderHook(() => useEditorToast());

    act(() => {
      result.current.showToast({ message: "Project exported.", tone: "success" });
    });

    expect(result.current.toast).toEqual({
      message: "Project exported.",
      tone: "success",
    });

    act(() => {
      result.current.showToast({
        message: "That connection already exists.",
        tone: "error",
      });
    });

    expect(result.current.toast).toEqual({
      message: "That connection already exists.",
      tone: "error",
    });
  });

  it("clears success and info toasts after three seconds", () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useEditorToast());

    act(() => {
      result.current.showToast({ message: "Project reset.", tone: "success" });
    });

    act(() => {
      vi.advanceTimersByTime(2999);
    });

    expect(result.current.toast?.message).toBe("Project reset.");

    act(() => {
      vi.advanceTimersByTime(1);
    });

    expect(result.current.toast).toBeNull();

    act(() => {
      result.current.showToast({ message: "Ready.", tone: "info" });
    });

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(result.current.toast).toBeNull();
  });

  it("keeps error toasts visible for five seconds", () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useEditorToast());

    act(() => {
      result.current.showToast({
        message: "Project file could not be read.",
        tone: "error",
      });
    });

    act(() => {
      vi.advanceTimersByTime(4999);
    });

    expect(result.current.toast?.message).toBe(
      "Project file could not be read.",
    );

    act(() => {
      vi.advanceTimersByTime(1);
    });

    expect(result.current.toast).toBeNull();
  });

  it("clears the active toast on demand", () => {
    const { result } = renderHook(() => useEditorToast());

    act(() => {
      result.current.showToast({ message: "Project imported.", tone: "success" });
    });
    act(() => {
      result.current.clearToast();
    });

    expect(result.current.toast).toBeNull();
  });
});
