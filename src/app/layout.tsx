import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ScoreSnap — Instant Scoreboards",
  description: "Create beautiful, real-time scoreboards in seconds. No signup required.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
