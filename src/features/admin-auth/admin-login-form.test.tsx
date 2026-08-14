// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("./admin-auth.action", () => ({ loginAdmin: vi.fn() }));

import { LoginForm } from "./admin-login-form";

afterEach(cleanup);

describe("LoginForm", () => {
  it("autofocuses password and lets an admin reveal it", async () => {
    const user = userEvent.setup();
    render(<LoginForm identity="Baithani" />);

    const password = screen.getByLabelText<HTMLInputElement>("Password");
    expect(document.activeElement).toBe(password);
    expect(password.type).toBe("password");

    await user.click(screen.getByRole("button", { name: "Show password" }));

    expect(password.type).toBe("text");
  });
});
