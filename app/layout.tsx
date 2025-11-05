import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "eatr-vibe | AI Meal Plan & Recipe",
  description: "Plan SEA-friendly meals with AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
