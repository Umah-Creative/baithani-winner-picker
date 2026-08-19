import "server-only";

import { headers } from "next/headers";

import { readInternalRequestContext } from "./request-context.server";
import type { RequestContext } from "./request-context.type";

const EMPTY_REQUEST_CONTEXT: RequestContext = {
  ipAddress: null,
  userAgent: null,
  acceptLanguage: null,
  requestId: null,
};

export async function getCurrentRequestContext(): Promise<RequestContext> {
  return readInternalRequestContext(await headers());
}

export async function getSafeCurrentRequestContext(): Promise<RequestContext> {
  try {
    return await getCurrentRequestContext();
  } catch {
    console.error("Request attribution failed.");
    return EMPTY_REQUEST_CONTEXT;
  }
}
