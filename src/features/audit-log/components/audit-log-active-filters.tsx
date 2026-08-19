import { Badge } from "@/components/ui/badge";

export function AuditLogActiveFilters(props: { filters: string[] }) {
  const { filters } = props;
  if (!filters.length) return null;

  return (
    <div
      className="flex flex-wrap items-center gap-2"
      aria-label="Active filters"
    >
      <span className="text-xs font-medium text-muted-foreground">Active</span>
      {filters.map((filter) => (
        <Badge key={filter} variant="outline">
          {filter}
        </Badge>
      ))}
    </div>
  );
}
