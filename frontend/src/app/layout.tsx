import type { Metadata } from "next";
import { Nunito_Sans } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { AppProviders } from "@/components/providers/app-provider";
import { SentryErrorBoundary } from "@/components/shared/sentry-error-boundary";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
import JsonLd from "@/components/shared/JsonLd";
import { organizationSchema, websiteSchema } from "@/lib/jsonLd";
import { ChatWidgetWrapper } from "@/components/shared/ChatWidgetWrapper";
import UserActivityTracker from "@/components/shared/UserActivityTracker";

const nunito = Nunito_Sans({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800", "900"],
  variable: "--font-nunito",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Arivo Holidays | Customized Holiday Tour Packages and Cab Rentals",
    template: "%s | Arivo Holidays",
  },
  description: "Book customized holiday tour packages, luxury stays, verified cabs, and local tour guides across Kashmir, Kerala, Himachal, Rajasthan and international destinations.",
  openGraph: {
    type: "website",
    siteName: "Arivo Holidays",
    locale: "en_IN",
    url: SITE_URL,
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Arivo Holidays" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Arivo Holidays",
    description: "Customized holiday tour packages and cab rentals across India.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: [
      { url: "/icon.png", type: "image/png", sizes: "512x512" },
      "/favicon.ico",
    ],
    shortcut: "/favicon.ico",
    apple: "/apple-icon.png",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn("h-full antialiased", nunito.variable, "font-sans")}
    >
      <body className="min-h-full flex flex-col font-sans text-[#1C1C1C]">
        <JsonLd data={organizationSchema} />
        <JsonLd data={websiteSchema} />
        <AppProviders>
          <SentryErrorBoundary>
            {children}
          </SentryErrorBoundary>
          <ChatWidgetWrapper />
          <UserActivityTracker />
        </AppProviders>
      </body>
    </html>
  );
}
