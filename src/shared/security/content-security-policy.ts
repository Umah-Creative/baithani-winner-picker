export function buildContentSecurityPolicy(
  nonce: string,
  development: boolean
): string {
  const scriptSources = [
    "'self'",
    `'nonce-${nonce}'`,
    "'strict-dynamic'",
    ...(development ? ["'unsafe-eval'"] : []),
  ];

  return [
    "default-src 'self'",
    `script-src ${scriptSources.join(" ")}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self' data:",
    `connect-src 'self'${development ? " ws: wss:" : ""}`,
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ].join("; ");
}
