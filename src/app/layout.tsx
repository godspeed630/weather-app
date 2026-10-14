import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Weather — Ajker Akash",
  description: "Live weather for any city",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
