type PreviewLogoProps = {
  logoUrl?: string;
  logoAlt: string;
};

export function PreviewLogo(props: PreviewLogoProps) {
  const { logoUrl, logoAlt } = props;

  return logoUrl ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={logoUrl}
      alt={logoAlt}
      className="max-h-16 max-w-36 object-contain"
    />
  ) : (
    <span className="text-sm font-semibold">Baithani</span>
  );
}
