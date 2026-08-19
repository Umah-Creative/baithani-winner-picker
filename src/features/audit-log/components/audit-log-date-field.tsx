"use client";

import { CalendarIcon } from "lucide-react";
import type { DateRange } from "react-day-picker";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

import { formatLogDateRange } from "../audit-log-date";

export function AuditLogDateField(props: {
  dateRange: DateRange | undefined;
  timeZone: string;
  onDateRangeChange: (range: DateRange | undefined) => void;
}) {
  const { dateRange, timeZone, onDateRangeChange } = props;

  return (
    <Field>
      <FieldLabel>Date range</FieldLabel>
      <FieldDescription>
        Dates use {timeZone || "UTC"} calendar days.
      </FieldDescription>
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
          {formatLogDateRange(dateRange)}
        </PopoverTrigger>
        <PopoverContent align="start" className="w-auto p-0">
          <Calendar
            mode="range"
            selected={dateRange}
            onSelect={onDateRangeChange}
            defaultMonth={dateRange?.from}
          />
        </PopoverContent>
      </Popover>
    </Field>
  );
}
