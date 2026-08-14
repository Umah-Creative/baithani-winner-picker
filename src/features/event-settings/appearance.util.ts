import { createBrandPalette } from "@/shared/brand/brand-color";

export function activeForegroundContrast(color: string): number | undefined {
  if (!/^#[0-9a-f]{6}$/i.test(color)) return undefined;

  const luminance = (hex: string) => {
    const channels = [1, 3, 5].map(
      (start) => Number.parseInt(hex.slice(start, start + 2), 16) / 255
    );
    return channels.reduce((total, channel, index) => {
      const linear =
        channel <= 0.03928
          ? channel / 12.92
          : ((channel + 0.055) / 1.055) ** 2.4;
      return total + linear * [0.2126, 0.7152, 0.0722][index];
    }, 0);
  };
  const accentLuminance = luminance(color);
  const foregroundLuminance = luminance(createBrandPalette(color).foreground);

  return (
    (Math.max(accentLuminance, foregroundLuminance) + 0.05) /
    (Math.min(accentLuminance, foregroundLuminance) + 0.05)
  );
}
