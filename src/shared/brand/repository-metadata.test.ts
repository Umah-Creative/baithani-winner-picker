import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const repositoryRoot = resolve(import.meta.dirname, "../../..");

function readRepositoryFile(path: string): string {
  return readFileSync(resolve(repositoryRoot, path), "utf8");
}

describe("repository metadata", () => {
  it("publishes accurate MIT and GitHub package metadata", () => {
    const packageJson = JSON.parse(readRepositoryFile("package.json")) as {
      private: boolean;
      license: string;
      author: string;
      repository: { type: string; url: string };
      bugs: { url: string };
      homepage: string;
    };

    expect(packageJson.private).toBe(true);
    expect(packageJson.license).toBe("MIT");
    expect(packageJson.author).toBe("Umah Creative");
    expect(packageJson.repository).toEqual({
      type: "git",
      url: "git+https://github.com/Umah-Creative/baithani-winner-picker.git",
    });
    expect(packageJson.bugs.url).toBe(
      "https://github.com/Umah-Creative/baithani-winner-picker/issues"
    );
    expect(packageJson.homepage).toBe(
      "https://github.com/Umah-Creative/baithani-winner-picker#readme"
    );
  });

  it("ships the standard license and keeps brand assets outside its grant", () => {
    const license = readRepositoryFile("LICENSE");
    const brandAssets = readRepositoryFile("BRAND_ASSETS.md");
    const readme = readRepositoryFile("README.md");

    expect(license).toContain("MIT License");
    expect(license).toContain("Copyright (c) 2026 Umah Creative");
    expect(license).toContain(
      'THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND'
    );
    expect(brandAssets).toContain("public/logos/");
    expect(brandAssets).toContain("public/baithani-icon-*.png");
    expect(readme).toContain("License-MIT");
    expect(readme).toContain("[Baithani brand assets](BRAND_ASSETS.md)");
  });
});
