import { TempoInit } from "@/components/tempo-init";
import { AuthProvider } from "@/components/auth/AuthProvider";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Antes De Firmar - Análisis de Documentos con IA",
  description:
    "Sube documentos legales y obtén análisis instantáneo para identificar posibles fallas antes de firmar.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
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
