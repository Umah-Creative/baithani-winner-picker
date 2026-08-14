const LIGHT_STAGE = "#fff8fc";
const DARK_STAGE = "#181217";
const LIGHT_FOREGROUND = "#171217";
const DARK_FOREGROUND = "#fff9fc";

type Rgb = {
  red: number;
  green: number;
  blue: number;
};

export type BrandPalette = {
  foreground: string;
  displayLight: string;
  displayDark: string;
};

function parseHex(hex: string): Rgb {
  const normalized = /^#[0-9a-f]{6}$/i.test(hex) ? hex : "#d076b4";

  return {
    red: Number.parseInt(normalized.slice(1, 3), 16),
    green: Number.parseInt(normalized.slice(3, 5), 16),
    blue: Number.parseInt(normalized.slice(5, 7), 16),
  };
}

function toHex(rgb: Rgb): string {
  return `#${[rgb.red, rgb.green, rgb.blue]
    .map((channel) => Math.round(channel).toString(16).padStart(2, "0"))
    .join("")}`;
}

function channelLuminance(channel: number): number {
  const normalized = channel / 255;
  return normalized <= 0.04045
    ? normalized / 12.92
    : ((normalized + 0.055) / 1.055) ** 2.4;
}

function luminance(color: string): number {
  const { red, green, blue } = parseHex(color);
  return (
    0.2126 * channelLuminance(red) +
    0.7152 * channelLuminance(green) +
    0.0722 * channelLuminance(blue)
  );
}

function contrastRatio(first: string, second: string): number {
  const brightest = Math.max(luminance(first), luminance(second));
  const darkest = Math.min(luminance(first), luminance(second));
  return (brightest + 0.05) / (darkest + 0.05);
}

function mix(first: string, second: string, amount: number): string {
  const source = parseHex(first);
  const target = parseHex(second);

  return toHex({
    red: source.red + (target.red - source.red) * amount,
    green: source.green + (target.green - source.green) * amount,
    blue: source.blue + (target.blue - source.blue) * amount,
  });
}

function ensureContrast(
  color: string,
  background: string,
  target: string
): string {
  if (contrastRatio(color, background) >= 4.5) {
    return color;
  }

  for (let amount = 0.08; amount <= 1; amount += 0.08) {
    const candidate = mix(color, target, amount);
    if (contrastRatio(candidate, background) >= 4.5) {
      return candidate;
    }
  }

  return target;
}

export function createBrandPalette(accent: string): BrandPalette {
  const foreground =
    contrastRatio(accent, LIGHT_FOREGROUND) >=
    contrastRatio(accent, DARK_FOREGROUND)
      ? LIGHT_FOREGROUND
      : DARK_FOREGROUND;

  return {
    foreground,
    displayLight: ensureContrast(accent, LIGHT_STAGE, LIGHT_FOREGROUND),
    displayDark: ensureContrast(accent, DARK_STAGE, DARK_FOREGROUND),
  };
}
