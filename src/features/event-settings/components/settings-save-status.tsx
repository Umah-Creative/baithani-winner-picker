import { Button } from "@/components/ui/button";

type SettingsSaveStatusProps = {
  status: string;
  pending: boolean;
};

export function SettingsSaveStatus(props: SettingsSaveStatusProps) {
  const { status, pending } = props;

  return (
    <div className="sticky bottom-4 z-10 flex flex-col gap-3 rounded-xl border border-border bg-card/95 p-3 shadow-lg backdrop-blur sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-muted-foreground" aria-live="polite">
        {status}
      </p>
      <Button type="submit" disabled={pending} size="lg">
        {pending ? "Saving…" : "Save settings"}
      </Button>
    </div>
  );
}
