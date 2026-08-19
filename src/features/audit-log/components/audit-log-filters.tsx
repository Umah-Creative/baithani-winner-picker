"use client";

import Link from "next/link";

import { Button, buttonVariants } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { serializeLogFilterDate } from "../audit-log-date";
import type { AdminLogFilters } from "../audit-log-view.type";
import { useAuditLogFilters } from "../hooks/use-audit-log-filters";
import { AuditLogActiveFilters } from "./audit-log-active-filters";
import { AuditLogAdvancedFields } from "./audit-log-advanced-fields";
import { AuditLogDateField } from "./audit-log-date-field";

export function AuditLogFilters(props: { filters: AdminLogFilters }) {
  const { filters } = props;
  const controller = useAuditLogFilters(filters);

  return (
    <form className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-4 sm:p-5">
      <input type="hidden" name="action" value={controller.action} />
      <input type="hidden" name="outcome" value={controller.outcome} />
      <input
        type="hidden"
        name="from"
        value={serializeLogFilterDate(controller.dateRange?.from)}
      />
      <input
        type="hidden"
        name="to"
        value={serializeLogFilterDate(controller.dateRange?.to)}
      />
      <input type="hidden" name="tz" value={controller.timeZone} />

      <div className="grid gap-4 md:grid-cols-3">
        <Field>
          <FieldLabel htmlFor="log-action">Action</FieldLabel>
          <Select
            items={controller.actionItems}
            value={controller.action || null}
            onValueChange={(value) => controller.setAction(value ?? "")}
          >
            <SelectTrigger id="log-action" className="min-h-11 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent alignItemWithTrigger={false} align="start">
              <SelectGroup>
                {controller.actionItems.map((item) => (
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
            items={controller.outcomeItems}
            value={controller.outcome || null}
            onValueChange={(value) => controller.setOutcome(value ?? "")}
          >
            <SelectTrigger id="log-outcome" className="min-h-11 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent alignItemWithTrigger={false} align="start">
              <SelectGroup>
                {controller.outcomeItems.map((item) => (
                  <SelectItem key={item.value ?? "all"} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </Field>

        <AuditLogDateField
          dateRange={controller.dateRange}
          timeZone={controller.timeZone}
          onDateRangeChange={controller.setDateRange}
        />
      </div>

      <AuditLogAdvancedFields
        ip={controller.ip}
        requestId={controller.requestId}
        initiallyOpen={Boolean(filters.ip || filters.requestId)}
        onIpChange={controller.setIp}
        onRequestIdChange={controller.setRequestId}
      />

      <AuditLogActiveFilters filters={controller.activeFilters} />

      <div className="flex flex-wrap items-center gap-2">
        <Button type="submit">Filter logs</Button>
        {controller.hasFilters ? (
          <Link
            href={controller.resetHref}
            className={buttonVariants({ variant: "outline" })}
          >
            Reset
          </Link>
        ) : null}
      </div>
    </form>
  );
}
