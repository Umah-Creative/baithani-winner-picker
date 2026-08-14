export const ADMIN_AUDIT_ACTIONS = [
  "auth.login",
  "auth.logout",
  "settings.update",
  "settings.update_failed",
  "logo.replace",
  "logo.remove",
] as const;

export type AdminAuditAction = (typeof ADMIN_AUDIT_ACTIONS)[number];
export type AdminAuditOutcome = "success" | "failure" | "denied";
export type AdminAuditMetadata = Record<string, unknown>;

export type AdminAuditRequestMetadata = {
  ipAddress: string | null;
  userAgent: string | null;
  acceptLanguage: string | null;
  requestId: string | null;
};

export type AdminAuditEventInput = {
  action: AdminAuditAction;
  outcome: AdminAuditOutcome;
  actor: string;
  request: AdminAuditRequestMetadata;
  metadata?: AdminAuditMetadata;
};

export type AdminAuditEvent = Omit<
  AdminAuditEventInput,
  "request" | "metadata"
> &
  AdminAuditRequestMetadata & {
    occurredAt: Date;
    metadata: AdminAuditMetadata;
  };

type LogoChangeInput = {
  hasExistingLogo: boolean;
  hasReplacementLogo: boolean;
  removeLogo: boolean;
};

const OMITTED_METADATA_KEY =
  /(?:password|cookie|authorization|token|secret|raw.*(?:body|header)|headers?|body|logo.*bytes|image.*bytes)/i;

export function sanitizeAuditMetadata(
  metadata: AdminAuditMetadata
): AdminAuditMetadata {
  return Object.fromEntries(
    Object.entries(metadata).flatMap(([key, value]) => {
      if (OMITTED_METADATA_KEY.test(key)) {
        return [];
      }

      const sanitized = sanitizeValue(value);
      return sanitized === undefined ? [] : [[key, sanitized]];
    })
  );
}

function sanitizeValue(value: unknown): unknown {
  if (
    value === null ||
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return value;
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (Buffer.isBuffer(value) || value instanceof Uint8Array) {
    return undefined;
  }

  if (Array.isArray(value)) {
    return value
      .map(sanitizeValue)
      .filter((item): item is NonNullable<typeof item> => item !== undefined);
  }

  if (typeof value === "object") {
    return sanitizeAuditMetadata(value as AdminAuditMetadata);
  }

  return undefined;
}

export function resolveLogoChange(
  input: LogoChangeInput
): "replace" | "remove" | "none" {
  if (input.hasReplacementLogo) {
    return "replace";
  }

  if (input.removeLogo && input.hasExistingLogo) {
    return "remove";
  }

  return "none";
}

export function getAdminAuditRequestMetadata(
  requestHeaders: Headers
): AdminAuditRequestMetadata {
  const forwardedFor = requestHeaders
    .get("x-forwarded-for")
    ?.split(",")[0]
    ?.trim();

  return {
    ipAddress: forwardedFor || requestHeaders.get("x-real-ip") || null,
    userAgent: requestHeaders.get("user-agent"),
    acceptLanguage: requestHeaders.get("accept-language"),
    requestId:
      requestHeaders.get("x-request-id") ?? requestHeaders.get("request-id"),
  };
}

export function buildAdminAuditEvent(
  input: AdminAuditEventInput
): AdminAuditEvent {
  return {
    action: input.action,
    outcome: input.outcome,
    actor: input.actor,
    ...input.request,
    occurredAt: new Date(),
    metadata: sanitizeAuditMetadata(input.metadata ?? {}),
  };
}
