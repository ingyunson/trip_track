// src/app/layout.tsx
import type { Metadata } from "next";
import { Providers } from "./providers";
import { PhotoProvider } from "../context/PhotoContext";
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
  title: "Travel Log - Share Your Journey",
  description: "Upload travel photos and create AI-generated travel logs to share with friends",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Providers>
          <PhotoProvider>
            {children}
          </PhotoProvider>
        </Providers>
      </body>
    </html>
  );
}
