import { RotateCcwIcon, Trash2Icon } from "lucide-react";

import { Button } from "@/components/ui/button";

type LogoRemovalStateProps = {
  onUndo: () => void;
};

export function LogoRemovalState(props: LogoRemovalStateProps) {
  const { onUndo } = props;

  return (
    <div className="flex min-h-32 flex-col items-center justify-center gap-3">
      <Trash2Icon className="size-6 text-destructive" aria-hidden="true" />
      <div>
        <p className="font-medium text-foreground">Logo marked for removal</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Current logo stays live until settings are saved.
        </p>
      </div>
      <Button type="button" variant="outline" onClick={onUndo}>
        <RotateCcwIcon data-icon="inline-start" aria-hidden="true" />
        Undo removal
      </Button>
    </div>
  );
}
