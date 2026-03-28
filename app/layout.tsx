import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Footer } from '@/components/Footer';
import { Navbar } from '@/components/Navbar';
import { Righteous, Inter } from 'next/font/google';

const righteous = Righteous({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-righteous',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Feast AI | AI Meal Plan & Nutrition Optimization",
  description: "Create personalized meal plans with AI-powered nutrition optimization",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "Feast AI",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${righteous.variable} ${inter.variable}`}>
      <body className="antialiased bg-background text-foreground font-body">
        <ThemeProvider>
          <Navbar />
          {children}
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
