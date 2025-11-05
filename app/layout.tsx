import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";

export const metadata: Metadata = {
  title: "Feast AI | AI Meal Plan & Nutrition Optimization",
  description: "Create personalized meal plans with AI-powered nutrition optimization",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-50">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
