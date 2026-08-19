"use client";

import { SlidersHorizontalIcon } from "lucide-react";

import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { REQUEST_METADATA_LIMITS } from "@/shared/request-context/request-context.constant";

export function AuditLogAdvancedFields(props: {
  ip: string;
  requestId: string;
  initiallyOpen: boolean;
  onIpChange: (value: string) => void;
  onRequestIdChange: (value: string) => void;
}) {
  const { ip, requestId, initiallyOpen, onIpChange, onRequestIdChange } = props;

  return (
    <details
      className="rounded-xl border border-border bg-muted/20 p-3"
      open={initiallyOpen || undefined}
    >
      <summary className="flex min-h-8 cursor-pointer items-center gap-2 text-sm font-medium text-foreground">
        <SlidersHorizontalIcon className="size-4" aria-hidden="true" />
        Advanced filters
      </summary>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Field>
          <FieldLabel htmlFor="log-ip">IP address</FieldLabel>
          <FieldDescription>Partial addresses are accepted.</FieldDescription>
          <Input
            id="log-ip"
            name="ip"
            value={ip}
            maxLength={REQUEST_METADATA_LIMITS.ipAddress}
            onChange={(event) => onIpChange(event.target.value)}
            placeholder="203.0.113.8"
            className="min-h-11"
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="log-request-id">Request ID</FieldLabel>
          <FieldDescription>Partial IDs are accepted.</FieldDescription>
          <Input
            id="log-request-id"
            name="requestId"
            value={requestId}
            maxLength={REQUEST_METADATA_LIMITS.requestId}
            onChange={(event) => onRequestIdChange(event.target.value)}
            placeholder="req-…"
            className="min-h-11"
          />
        </Field>
      </div>
    </details>
  );
}
