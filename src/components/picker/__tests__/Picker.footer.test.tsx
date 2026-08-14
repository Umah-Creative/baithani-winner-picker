// @vitest-environment jsdom

import type { ComponentProps, ReactNode } from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("motion/react", () => ({
  domAnimation: {},
  LazyMotion: (props: { children: ReactNode }) => props.children,
  m: {
    main: (
      props: ComponentProps<"main"> & {
        initial?: unknown;
        animate?: unknown;
        transition?: unknown;
      }
    ) => {
      const { children, initial, animate, transition, ...mainProps } = props;
      void initial;
      void animate;
      void transition;
      return <main {...mainProps}>{children}</main>;
    },
  },
  useReducedMotion: () => true,
}));
vi.mock("@/components/ui/alert-dialog", () => ({
  AlertDialog: (props: { children: ReactNode }) => props.children,
  AlertDialogAction: (props: { children: ReactNode }) => props.children,
  AlertDialogCancel: (props: { children: ReactNode }) => props.children,
  AlertDialogContent: (props: { children: ReactNode }) => props.children,
  AlertDialogDescription: (props: { children: ReactNode }) => props.children,
  AlertDialogFooter: (props: { children: ReactNode }) => props.children,
  AlertDialogHeader: (props: { children: ReactNode }) => props.children,
  AlertDialogTitle: (props: { children: ReactNode }) => props.children,
}));
vi.mock("../ConfettiLayer", () => ({ ConfettiLayer: () => null }));
vi.mock("../DrawnNumbers", () => ({ DrawnNumbers: () => null }));
vi.mock("../PickerToolbar", () => ({ PickerToolbar: () => null }));
vi.mock("../RangeControls", () => ({ RangeControls: () => null }));
vi.mock("../WinnerDisplay", () => ({ WinnerDisplay: () => null }));
vi.mock("../use-candidate-pool", () => ({
  useCandidatePool: () => ({
    candidates: [1, 2, 3],
    drawnNumbers: [4, 5],
    drawnCount: 2,
    draw: vi.fn(),
    undoLast: vi.fn(),
    reset: vi.fn(),
  }),
}));
vi.mock("../use-picker-audio", () => ({
  usePickerAudio: () => ({
    muted: false,
    toggleMuted: vi.fn(),
    startDraw: vi.fn(),
    startReveal: vi.fn(),
    playWinner: vi.fn(),
    stopAll: vi.fn(),
  }),
}));
vi.mock("../use-picker-spin", () => ({
  usePickerSpin: () => ({
    state: { status: "idle" },
    start: vi.fn(() => false),
    reveal: vi.fn(() => false),
    reset: vi.fn(),
  }),
}));

import { Picker } from "../Picker";

afterEach(cleanup);

describe("Picker footer", () => {
  it("renders project attribution and keeps the drawn count available to assistive technology", () => {
    render(
      <Picker
        settings={{
          title: "Baithani Night",
          description: "Door prize draw",
          accentColor: "#d076b4",
          hasLogo: false,
          logoAlt: "Baithani logo",
          minRange: 1,
          maxRange: 100,
          excludedNumbers: [],
          updatedAt: "2026-08-14T12:00:00.000Z",
        }}
      />
    );

    expect(screen.getByRole("contentinfo")).toBeTruthy();
    expect(screen.getByText("2 numbers drawn.")).toBeTruthy();
  });
});
