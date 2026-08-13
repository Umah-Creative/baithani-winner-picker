import type { Metadata } from "next";
import { headers } from "next/headers";
import { Geist, Geist_Mono, Inter } from "next/font/google";

import { getEventSettings } from "@/lib/event-settings.service";

import "./globals.css";
import { cn } from "@/lib/utils";

const inter = Inter({subsets:['latin'],variable:'--font-sans'});

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
  const settings = await getEventSettings();

  const title = settings?.title ?? "Baithani Winner Picker";
  const description =
    settings?.description ?? "Doorprize winner picker for Baithani events.";

  let ogImage: string | undefined;
  if (settings?.hasLogo) {
    const headerList = await headers();
    const host = headerList.get("x-forwarded-host") ?? headerList.get("host");
    const protocol = headerList.get("x-forwarded-proto") ?? "https";
    ogImage = host ? `${protocol}://${host}/api/media/logo` : "/api/media/logo";
  }

  return {
    title,
    description,
    icons: {
      icon: [
        { url: "/favicon.ico", sizes: "any" },
        { url: "/favicon-32x32.png", type: "image/png", sizes: "32x32" },
        { url: "/favicon-16x16.png", type: "image/png", sizes: "16x16" },
      ],
      apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
      other: [
        {
          rel: "manifest",
          url: "/site.webmanifest",
        },
      ],
    },
    openGraph: {
      title,
      description,
      images: ogImage ? [{ url: ogImage }] : undefined,
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getEventSettings();

  return (
    <html
      lang="en"
      className={cn("h-full antialiased dark", geistSans.variable, geistMono.variable, "font-sans", inter.variable)}
      style={
        {
          "--brand": settings?.accentColor ?? "#f0b429",
        } as React.CSSProperties
      }
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
