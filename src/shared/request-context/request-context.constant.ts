export const INTERNAL_CLIENT_IP_HEADER = "x-baithani-client-ip";
export const INTERNAL_REQUEST_ID_HEADER = "x-baithani-request-id";
export const CSP_NONCE_HEADER = "x-nonce";

export const REQUEST_METADATA_LIMITS = {
  ipAddress: 45,
  requestId: 128,
  userAgent: 512,
  acceptLanguage: 256,
} as const;
