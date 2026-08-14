"use client";

import { useMemo, useState } from "react";
import { format, isValid, parse } from "date-fns";
import { CalendarIcon, SlidersHorizontalIcon } from "lucide-react";
import Link from "next/link";
import type { DateRange } from "react-day-picker";

import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ADMIN_AUDIT_ACTIONS } from "@/lib/admin-audit.shared";
import {
  ADMIN_AUDIT_OUTCOMES,
  type AdminLogFilters,
} from "@/lib/admin-logs.shared";
import { cn } from "@/lib/utils";

import { formatAuditAction, formatAuditOutcome } from "./admin-log-labels";

type LogFiltersProps = {
  filters: AdminLogFilters;
};

function parseFilterDate(value: string | undefined): Date | undefined {
  if (!value) return undefined;
  const date = parse(value, "yyyy-MM-dd", new Date());
  return isValid(date) ? date : undefined;
}

function formatDateRange(range: DateRange | undefined): string {
  if (!range?.from) return "Choose date range";
  if (!range.to) return format(range.from, "MMM d, yyyy");
  return `${format(range.from, "MMM d, yyyy")} – ${format(range.to, "MMM d, yyyy")}`;
}

export function serializeLogFilterDate(date: Date | undefined): string {
  return date ? format(date, "yyyy-MM-dd") : "";
}

export function LogFilters(props: LogFiltersProps) {
  const { filters } = props;
  const [action, setAction] = useState(filters.action ?? "");
  const [outcome, setOutcome] = useState(filters.outcome ?? "");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(() => {
    const from = parseFilterDate(filters.from);
    const to = parseFilterDate(filters.to);
    return from || to ? { from, to } : undefined;
  });
  const [ip, setIp] = useState(filters.ip ?? "");
  const [requestId, setRequestId] = useState(filters.requestId ?? "");
  const actionItems = useMemo(
    () => [
      { label: "All actions", value: null },
      ...ADMIN_AUDIT_ACTIONS.map((value) => ({
        label: formatAuditAction(value),
        value,
      })),
    ],
    []
  );
  const outcomeItems = useMemo(
    () => [
      { label: "All outcomes", value: null },
      ...ADMIN_AUDIT_OUTCOMES.map((value) => ({
        label: formatAuditOutcome(value),
        value,
      })),
    ],
    []
  );
  const hasFilters = Boolean(
    action || outcome || dateRange?.from || dateRange?.to || ip || requestId
  );
  const activeFilters = [
    action ? `Action: ${formatAuditAction(action)}` : undefined,
    outcome ? `Outcome: ${formatAuditOutcome(outcome)}` : undefined,
    dateRange?.from ? `Dates: ${formatDateRange(dateRange)}` : undefined,
    ip ? `IP: ${ip}` : undefined,
    requestId ? `Request: ${requestId}` : undefined,
  ].filter((value): value is string => Boolean(value));

  return (
    <form className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-4 sm:p-5">
      <input type="hidden" name="action" value={action} />
      <input type="hidden" name="outcome" value={outcome} />
      <input
        type="hidden"
        name="from"
        value={serializeLogFilterDate(dateRange?.from)}
      />
      <input
        type="hidden"
        name="to"
        value={serializeLogFilterDate(dateRange?.to)}
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Field>
          <FieldLabel htmlFor="log-action">Action</FieldLabel>
          <Select
            items={actionItems}
            value={action || null}
            onValueChange={(value) => setAction(value ?? "")}
          >
            <SelectTrigger id="log-action" className="min-h-11 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent alignItemWithTrigger={false} align="start">
              <SelectGroup>
                {actionItems.map((item) => (
                  <SelectItem key={item.value ?? "all"} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </Field>

        <Field>
          <FieldLabel htmlFor="log-outcome">Outcome</FieldLabel>
          <Select
            items={outcomeItems}
            value={outcome || null}
            onValueChange={(value) => setOutcome(value ?? "")}
          >
            <SelectTrigger id="log-outcome" className="min-h-11 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent alignItemWithTrigger={false} align="start">
              <SelectGroup>
                {outcomeItems.map((item) => (
                  <SelectItem key={item.value ?? "all"} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </Field>

        <Field>
          <FieldLabel>Date range</FieldLabel>
          <Popover>
            <PopoverTrigger
              render={
                <Button
                  type="button"
                  variant="outline"
                  className={cn(
                    "min-h-11 w-full justify-start px-3 font-normal",
                    !dateRange?.from && "text-muted-foreground"
                  )}
                />
              }
            >
              <CalendarIcon data-icon="inline-start" aria-hidden="true" />
              {formatDateRange(dateRange)}
            </PopoverTrigger>
            <PopoverContent align="start" className="w-auto p-0">
              <Calendar
                mode="range"
                selected={dateRange}
                onSelect={setDateRange}
                defaultMonth={dateRange?.from}
              />
            </PopoverContent>
          </Popover>
        </Field>
      </div>

      <details
        className="rounded-xl border border-border bg-muted/20 p-3"
        open={Boolean(filters.ip || filters.requestId) || undefined}
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
              onChange={(event) => setIp(event.target.value)}
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
              onChange={(event) => setRequestId(event.target.value)}
              placeholder="req-…"
              className="min-h-11"
            />
          </Field>
        </div>
      </details>

      {activeFilters.length ? (
        <div
          className="flex flex-wrap items-center gap-2"
          aria-label="Active filters"
        >
          <span className="text-xs font-medium text-muted-foreground">
            Active
          </span>
          {activeFilters.map((filter) => (
            <Badge key={filter} variant="outline">
              {filter}
            </Badge>
          ))}
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-2">
        <Button type="submit">Filter logs</Button>
        {hasFilters ? (
          <Link
            href="/admin/logs"
            className={buttonVariants({ variant: "outline" })}
          >
            Reset
          </Link>
        ) : null}
      </div>
    </form>
  );
}
