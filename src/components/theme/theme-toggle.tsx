"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { useTheme } from "./theme-provider";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon-xl"
        aria-hidden="true"
        className="invisible"
      />
    );
  }

  const isDark = theme === "dark";
  const label = isDark ? "Switch to light theme" : "Switch to dark theme";

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            variant="ghost"
            size="icon-xl"
            onClick={() => setTheme(isDark ? "light" : "dark")}
            aria-label={label}
          />
        }
      >
        {isDark ? <Sun /> : <Moon />}
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}
