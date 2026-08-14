import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";

import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { buildEventMetadata } from "@/lib/event-metadata";
import { getEventSettings } from "@/lib/event-settings.service";
import { resolveSiteUrl } from "@/lib/site-url";
import { cn } from "@/lib/utils";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const dynamic = "force-dynamic";

const THEME_STORAGE_KEY = "baithani-winner-picker:theme";
const themeScript = `
  (() => {
    try {
      const stored = window.localStorage.getItem("${THEME_STORAGE_KEY}");
      const theme = stored === "light" || stored === "dark"
        ? stored
        : "light";
      const root = document.documentElement;
      root.classList.toggle("dark", theme === "dark");
      root.dataset.theme = theme;
      root.style.colorScheme = theme;
    } catch {}
  })();
`;

export async function generateMetadata(): Promise<Metadata> {
  const [settings, siteUrl] = await Promise.all([
    getEventSettings(),
    resolveSiteUrl(),
  ]);
  return buildEventMetadata(settings, siteUrl);
}

export default async function RootLayout(
  props: Readonly<{ children: React.ReactNode }>
) {
  const { children } = props;
  const settings = await getEventSettings();

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "h-full antialiased",
        geistSans.variable,
        geistMono.variable,
        "font-sans"
      )}
      style={
        {
          "--brand": settings?.accentColor ?? "#d076b4",
        } as React.CSSProperties
      }
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="flex min-h-full flex-col" suppressHydrationWarning>
        <ThemeProvider>
          <TooltipProvider>{children}</TooltipProvider>
          <Toaster richColors position="bottom-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
