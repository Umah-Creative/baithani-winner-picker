"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

export function useCopyFeedback(value: string | undefined, disabled: boolean) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 2_000);
    return () => window.clearTimeout(timer);
  }, [copied]);

  async function copy() {
    if (disabled || !value) return;

    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
    } catch {
      toast.error("Could not copy the event link. Try again.");
    }
  }

  return { copied, copy };
}
