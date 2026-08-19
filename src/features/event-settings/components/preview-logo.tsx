import Image from "next/image";

import { resolveSafeLogoPreviewUrl } from "../logo-preview-url.util";

type PreviewLogoProps = {
  logoUrl?: string;
  logoAlt: string;
};

export function PreviewLogo(props: PreviewLogoProps) {
  const { logoUrl, logoAlt } = props;
  const safeLogoUrl = resolveSafeLogoPreviewUrl(logoUrl);

  return safeLogoUrl ? (
    <Image
      src={safeLogoUrl}
      alt={logoAlt}
      width={144}
      height={64}
      unoptimized
      className="max-h-16 max-w-36 object-contain"
    />
  ) : (
    <span className="text-sm font-semibold">Baithani</span>
  );
}
