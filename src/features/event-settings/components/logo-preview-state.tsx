import { ImagePlusIcon, Trash2Icon } from "lucide-react";
import Image from "next/image";

import { Button } from "@/components/ui/button";

import { resolveSafeLogoPreviewUrl } from "../logo-preview-url.util";

type LogoPreviewStateProps = {
  imageUrl?: string;
  imageAlt: string;
  replacementFile?: File;
  onReplace: () => void;
  onRemove: () => void;
};

function formatFileSize(bytes: number): string {
  return `${(bytes / 1024 / 1024).toFixed(bytes < 1024 * 1024 ? 2 : 1)} MB`;
}

export function LogoPreviewState(props: LogoPreviewStateProps) {
  const { imageUrl, imageAlt, replacementFile, onReplace, onRemove } = props;
  const safeImageUrl = resolveSafeLogoPreviewUrl(imageUrl);

  return (
    <>
      <div className="flex min-h-28 w-full items-center justify-center rounded-lg bg-background/70 p-4">
        {safeImageUrl ? (
          <Image
            src={safeImageUrl}
            alt={imageAlt}
            width={224}
            height={112}
            unoptimized
            className="max-h-28 max-w-full object-contain"
          />
        ) : (
          <p className="text-sm text-muted-foreground">
            Logo preview unavailable
          </p>
        )}
      </div>
      {replacementFile ? (
        <div className="max-w-full">
          <p className="truncate text-sm font-medium text-foreground">
            {replacementFile.name}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {formatFileSize(replacementFile.size)} · replacement selected
          </p>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">Current event logo</p>
      )}
      <div className="flex flex-wrap justify-center gap-2">
        <Button type="button" variant="outline" onClick={onReplace}>
          <ImagePlusIcon data-icon="inline-start" aria-hidden="true" />
          Replace
        </Button>
        <Button type="button" variant="destructive" onClick={onRemove}>
          <Trash2Icon data-icon="inline-start" aria-hidden="true" />
          Remove
        </Button>
      </div>
    </>
  );
}
