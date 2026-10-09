import type { Metadata } from "next";
import "@fontsource/newsreader/400.css";
import "@fontsource/newsreader/400-italic.css";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "./globals.css";
import { LangProvider } from "@/i18n";

export const metadata: Metadata = {
  title: "Toronto Development Pipeline — which neighbourhoods gained homes, and how long permits take",
  description:
    "A normalized feed of Toronto's housing development pipeline: 2,391 applications with statuses and proposed units, net homes gained by neighbourhood, and building-permit issuance times. Explorer, REST API, OpenAPI docs, and MCP tools. Open data, MIT licensed.",
  openGraph: {
    title: "Toronto Development Pipeline: 2,391 applications, 124,326 homes gained net",
    description:
      "2,391 development applications with a normalized proposed/active/built status, 124,326 homes actually gained by neighbourhood, and median permit issuance times from 202,779 permits: a New Building permit takes 272 days, a small residential project 19. Explorer, REST API, OpenAPI docs, and MCP tools.",
    url: "https://development.canada.nshipyard.com/",
    siteName: "Open Nshipyard",
    type: "website",
    images: [
      {
        url: "https://development.canada.nshipyard.com/og-image.png",
        width: 1200,
        height: 630,
        alt: "Toronto Development Pipeline: 2,391 pipeline applications, 124,326 homes gained net, 272 days median New Building permit",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Toronto Development Pipeline: 2,391 applications, 124,326 homes gained net",
    description:
      "2,391 development applications with a normalized proposed/active/built status, 124,326 homes actually gained by neighbourhood, and median permit issuance times from 202,779 permits: a New Building permit takes 272 days. Explorer, REST API, OpenAPI docs, and MCP tools.",
    images: ["https://development.canada.nshipyard.com/og-image.png"],
  },
  icons: {
    icon: [
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      "/favicon.ico",
    ],
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body className="min-h-full flex flex-col">
        <LangProvider>{children}</LangProvider>
      </body>
    </html>
  );
}
