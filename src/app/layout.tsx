import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Stream It",
  description: "Stream your uploaded videos with ease using Stream It - the ultimate video streaming app built with Next.js and React.",
  icons: {
    icon: '/logo.png',
    shortcut: '/logo-full.png'
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
      
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`} 
      
    >
      <body className="min-h-full max-h-full flex flex-col">{children}</body>
    </html>
  );
}
