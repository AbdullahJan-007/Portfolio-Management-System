import type { Metadata, Viewport } from "next";
import "./globals.css";

const FAVICON =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop offset='0%25' stop-color='%236366f1'/%3E%3Cstop offset='50%25' stop-color='%238b5cf6'/%3E%3Cstop offset='100%25' stop-color='%2306b6d4'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='32' height='32' rx='8' fill='url(%23g)'/%3E%3Cpath d='M11 10l-4 6 4 6' stroke='white' stroke-width='2.4' fill='none' stroke-linecap='round' stroke-linejoin='round'/%3E%3Cpath d='M21 10l4 6-4 6' stroke='white' stroke-width='2.4' fill='none' stroke-linecap='round' stroke-linejoin='round'/%3E%3Cpath d='M18 7l-4 18' stroke='white' stroke-width='2.4' fill='none' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E";

export const metadata: Metadata = {
  metadataBase: new URL("https://portfolio-manager.example.com"),
  title: {
    default: "Portfolio Manager — Build & manage your developer portfolio",
    template: "%s · Portfolio Manager",
  },
  description:
    "A full-stack portfolio management system. Register, log in, and manage your profile, skills and projects through a modern, interactive dashboard — then share a live, always up-to-date preview.",
  keywords: [
    "portfolio manager",
    "developer portfolio",
    "portfolio CMS",
    "Next.js",
    "Prisma",
    "personal website builder",
  ],
  icons: {
    icon: FAVICON,
  },
  openGraph: {
    title: "Portfolio Manager",
    description:
      "Build, manage and preview your developer portfolio in one modern dashboard.",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#0c0e15",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="min-h-screen bg-slate-50 font-sans">{children}</body>
    </html>
  );
}
