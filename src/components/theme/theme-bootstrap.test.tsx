// @vitest-environment jsdom

import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { ThemeBootstrap } from "./theme-bootstrap";

afterEach(cleanup);

describe("ThemeBootstrap", () => {
  it("applies the request nonce to the inline bootstrap script", () => {
    const { container } = render(<ThemeBootstrap nonce="request-nonce" />);

    expect(container.querySelector("script")?.nonce).toBe("request-nonce");
  });
});
