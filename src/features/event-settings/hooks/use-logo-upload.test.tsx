// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useLogoUpload } from "./use-logo-upload";

const onDirty = vi.fn();
const onVisualChange = vi.fn();

function LogoUploadHarness(props: { hasLogo?: boolean }) {
  const { hasLogo = true } = props;
  const {
    fileInputRef,
    onInputChange,
    state,
    imageUrl,
    markForRemoval,
    undoRemoval,
    onDrop,
    clientError,
  } = useLogoUpload({
    hasLogo,
    existingLogoAlt: "Baithani mark",
    updatedAt: "2026-08-15T00:00:00.000Z",
    onDirty,
    onVisualChange,
  });

  return (
    <div>
      <input
        aria-label="Logo"
        ref={fileInputRef}
        type="file"
        onChange={onInputChange}
      />
      <p data-testid="state">{state.kind}</p>
      <p data-testid="image-url">{imageUrl}</p>
      <p data-testid="client-error">{clientError}</p>
      <button type="button" onClick={markForRemoval}>
        Remove
      </button>
      <button type="button" onClick={undoRemoval}>
        Undo
      </button>
      <div data-testid="dropzone" onDrop={onDrop} />
    </div>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  Object.defineProperty(URL, "createObjectURL", {
    configurable: true,
    value: vi.fn(() => "blob:http://localhost:3000/replacement"),
  });
  Object.defineProperty(URL, "revokeObjectURL", {
    configurable: true,
    value: vi.fn(),
  });
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("useLogoUpload", () => {
  it("replaces, removes, and restores the saved logo without conflicting state", () => {
    render(<LogoUploadHarness />);
    const input = screen.getByLabelText<HTMLInputElement>("Logo");
    const replacement = new File(["new"], "replacement.webp", {
      type: "image/webp",
    });

    fireEvent.change(input, { target: { files: [replacement] } });
    expect(screen.getByTestId("state").textContent).toBe("replacement");
    expect(screen.getByTestId("image-url").textContent).toBe(
      "blob:http://localhost:3000/replacement"
    );

    fireEvent.click(screen.getByRole("button", { name: "Remove" }));
    expect(screen.getByTestId("state").textContent).toBe("marked-removal");
    expect(input.value).toBe("");
    expect(URL.revokeObjectURL).toHaveBeenCalledWith(
      "blob:http://localhost:3000/replacement"
    );

    fireEvent.click(screen.getByRole("button", { name: "Undo" }));
    expect(screen.getByTestId("state").textContent).toBe("existing");
    expect(onVisualChange).toHaveBeenLastCalledWith({
      visible: true,
      previewUrl: undefined,
      markedForRemoval: false,
    });
  });

  it("synchronizes a dropped file into the native input and cleans its blob", () => {
    class DataTransferMock {
      files: File[] = [];
      items = { add: (file: File) => this.files.push(file) };
    }
    vi.stubGlobal("DataTransfer", DataTransferMock);
    const view = render(<LogoUploadHarness hasLogo={false} />);
    const input = screen.getByLabelText<HTMLInputElement>("Logo");
    let assignedFiles: File[] = [];
    Object.defineProperty(input, "files", {
      configurable: true,
      get: () => assignedFiles,
      set: (files: File[]) => {
        assignedFiles = files;
      },
    });
    const dropped = new File(["drop"], "dropped.png", { type: "image/png" });

    fireEvent.drop(screen.getByTestId("dropzone"), {
      dataTransfer: { files: [dropped] },
    });

    expect(input.files?.[0]).toBe(dropped);
    expect(screen.getByTestId("state").textContent).toBe("replacement");
    view.unmount();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith(
      "blob:http://localhost:3000/replacement"
    );
  });

  it("rejects unsupported files without dirtying the saved logo", () => {
    render(<LogoUploadHarness />);

    fireEvent.change(screen.getByLabelText("Logo"), {
      target: {
        files: [new File(["text"], "notes.txt", { type: "text/plain" })],
      },
    });

    expect(screen.getByTestId("state").textContent).toBe("existing");
    expect(onDirty).not.toHaveBeenCalled();
  });

  it("clears stale client errors when the user removes or restores the logo", () => {
    render(<LogoUploadHarness />);
    fireEvent.change(screen.getByLabelText("Logo"), {
      target: {
        files: [new File(["text"], "notes.txt", { type: "text/plain" })],
      },
    });
    expect(screen.getByTestId("client-error").textContent).toContain("PNG");

    fireEvent.click(screen.getByRole("button", { name: "Remove" }));
    expect(screen.getByTestId("client-error").textContent).toBe("");

    fireEvent.change(screen.getByLabelText("Logo"), {
      target: {
        files: [new File(["text"], "notes.txt", { type: "text/plain" })],
      },
    });
    fireEvent.click(screen.getByRole("button", { name: "Undo" }));
    expect(screen.getByTestId("client-error").textContent).toBe("");
  });
});
