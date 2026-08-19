import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { headers } from "next/headers";
import { Toaster } from "sonner";

import { ThemeProvider } from "@/components/theme/theme-provider";
import { ThemeBootstrap } from "@/components/theme/theme-bootstrap";
import { TooltipProvider } from "@/components/ui/tooltip";
import { buildEventMetadata } from "@/features/event-sharing/event-metadata";
import { DEFAULT_ACCENT_COLOR } from "@/features/event-settings/event-settings.constant";
import { getEventSettings } from "@/features/event-settings/server/event-settings.query";
import { resolveSiteUrl } from "@/shared/site-url/resolve-site-url.server";
import { cn } from "@/lib/utils";
import { CSP_NONCE_HEADER } from "@/shared/request-context/request-context.constant";

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
  const [settings, requestHeaders] = await Promise.all([
    getEventSettings(),
    headers(),
  ]);
  const nonce = requestHeaders.get(CSP_NONCE_HEADER) ?? undefined;

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
          "--brand": settings?.accentColor ?? DEFAULT_ACCENT_COLOR,
        } as React.CSSProperties
      }
    >
      <head>
        <ThemeBootstrap nonce={nonce} />
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
