// @vitest-environment jsdom

import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ reducedMotion: true }));

vi.mock("motion/react", () => ({
  useReducedMotion: () => mocks.reducedMotion,
}));

import type { PickerAudioEngine } from "./use-picker-audio";
import { usePickerController } from "./use-picker-controller";
import { PICKER_STORAGE_KEY } from "../picker.constant";

const settings = {
  title: "Baithani Night",
  description: "Door prize draw",
  accentColor: "#d076b4",
  hasLogo: false,
  logoAlt: "Baithani mark",
  minRange: 1,
  maxRange: 2,
  excludedNumbers: [],
  updatedAt: "2026-08-15T00:00:00.000Z",
};

function audioHarness() {
  const engine: PickerAudioEngine = {
    startDraw: vi.fn(),
    startReveal: vi.fn(),
    playWinner: vi.fn(),
    stopAll: vi.fn(),
    dispose: vi.fn(),
  };
  return { engine, factory: () => engine };
}

beforeEach(() => {
  localStorage.clear();
  mocks.reducedMotion = true;
  vi.spyOn(Math, "random").mockReturnValue(0);
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("usePickerController", () => {
  it("coordinates keyboard draw, persistence, undo, and session reset", async () => {
    const audio = audioHarness();
    const { result } = renderHook(() =>
      usePickerController(settings, { audioEngineFactory: audio.factory })
    );
    await waitFor(() => expect(result.current.drawnCount).toBe(0));

    act(() =>
      window.dispatchEvent(new KeyboardEvent("keydown", { code: "Space" }))
    );
    expect(result.current.state.status).toBe("spinning");
    expect(audio.engine.startDraw).toHaveBeenCalledWith(false);

    act(() =>
      window.dispatchEvent(new KeyboardEvent("keydown", { code: "Space" }))
    );
    expect(result.current.state.status).toBe("winner");
    expect(result.current.winner).toBe(1);
    expect(result.current.drawnNumbers).toEqual([1]);
    expect(localStorage.getItem(PICKER_STORAGE_KEY)).toBe("[1]");
    expect(audio.engine.playWinner).toHaveBeenCalledWith(false);

    act(() => result.current.handleUndoLast());
    expect(result.current.drawnNumbers).toEqual([]);
    expect(localStorage.getItem(PICKER_STORAGE_KEY)).toBe("[]");

    act(() => result.current.handlePrimaryAction());
    act(() => result.current.handlePrimaryAction());
    act(() => result.current.handleRequestNewSession());
    expect(result.current.newSessionOpen).toBe(true);
    act(() => result.current.handleNewSession());
    expect(result.current.newSessionOpen).toBe(false);
    expect(result.current.drawnNumbers).toEqual([]);
  });

  it("runs reveal timing and audio sequencing when motion is enabled", () => {
    mocks.reducedMotion = false;
    vi.useFakeTimers();
    const audio = audioHarness();
    const { result } = renderHook(() =>
      usePickerController(settings, { audioEngineFactory: audio.factory })
    );

    act(() => result.current.handlePrimaryAction());
    act(() => result.current.handlePrimaryAction());
    expect(result.current.state.status).toBe("revealing");
    expect(audio.engine.startReveal).toHaveBeenCalledOnce();

    act(() => vi.runAllTimers());
    expect(result.current.state.status).toBe("winner");
    expect(result.current.drawnNumbers).toEqual([1]);
    expect(audio.engine.playWinner).toHaveBeenCalledOnce();
  });

  it("ignores keyboard shortcuts from editable controls and stops audio on range changes", () => {
    const audio = audioHarness();
    const { result } = renderHook(() =>
      usePickerController(settings, { audioEngineFactory: audio.factory })
    );
    const input = document.createElement("input");
    document.body.append(input);

    act(() =>
      input.dispatchEvent(
        new KeyboardEvent("keydown", { code: "Space", bubbles: true })
      )
    );
    expect(result.current.state.status).toBe("idle");

    act(() => result.current.handleMaxChange("20"));
    expect(audio.engine.stopAll).toHaveBeenCalled();
    expect(result.current.maxValue).toBe("20");
  });
});
