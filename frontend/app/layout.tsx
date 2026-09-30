import type { Metadata } from "next";
import { Work_Sans, Anton } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/context/AppContext";

// Body/UI text - clean and highly legible at small card/button sizes.
const bodyFont = Work_Sans({
  variable: "--font-body",
  subsets: ["latin"],
});

// Headlines and the wordmark - bold, condensed, poster/signage energy,
// closer to how an actual event flyer reads than a generic display serif.
const displayFont = Anton({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: "Eventide | Live Event & Vending Management Platform",
  description: "Discover live concerts, tech summits, food expos, and vendor booth opportunities across East Africa.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${bodyFont.variable} ${displayFont.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-paper dark:bg-ink-950 text-ink-900 dark:text-ink-50 transition-colors">
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
