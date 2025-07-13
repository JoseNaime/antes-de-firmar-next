import { TempoInit } from "@/components/tempo-init";
import { AuthProvider } from "@/components/auth/AuthProvider";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Legal Document AI - AI-Powered Document Analysis",
  description:
    "Upload legal documents and get instant AI analysis to identify potential flaws before signing.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <Script src="https://api.tempolabs.ai/proxy-asset?url=https://storage.googleapis.com/tempo-public-assets/error-handling.js" />
      <body className={inter.className} suppressHydrationWarning>
        <AuthProvider>
          {children}
          <TempoInit />
        </AuthProvider>
      </body>
    </html>
  );
}
