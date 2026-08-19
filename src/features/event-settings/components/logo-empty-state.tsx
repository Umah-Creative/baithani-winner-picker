import { ImagePlusIcon } from "lucide-react";

type LogoEmptyStateProps = {
  pending: boolean;
  onBrowse: () => void;
};

export function LogoEmptyState(props: LogoEmptyStateProps) {
  const { pending, onBrowse } = props;

  return (
    <button
      type="button"
      disabled={pending}
      onClick={onBrowse}
      className="flex min-h-32 w-full flex-col items-center justify-center gap-2 rounded-lg text-sm text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/40"
    >
      <ImagePlusIcon className="size-6 text-primary" aria-hidden="true" />
      <span className="font-medium text-foreground">
        Drop a logo here or browse files
      </span>
      <span className="text-xs">PNG, JPEG, WebP, GIF — max 5 MB</span>
    </button>
  );
}
