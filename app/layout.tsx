import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AXIS — CRM Control Tower",
  description: "Operational intelligence for CRM RUN, product evolution, UAT and release governance.",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased">{children}</body>
    </html>
  );
}
