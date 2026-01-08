import type { Metadata } from "next";
import type { Viewport } from "next";
import { Lato as GoogleLato, Montserrat_Alternates } from "next/font/google";
import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";
import BottomNav from "@/components/BottomNav";
config.autoAddCss = false;

import "./globals.css";

const Lato = GoogleLato({
  subsets: ["latin"],
  variable: "--font-text",
  weight: ["400"],
});

const MontserratAlternates = Montserrat_Alternates({
  subsets: ["latin"],
  variable: "--font-title",
  weight: ["400"],
});

export const metadata: Metadata = {
  title: "Toy Verse",
  description: "collection de jouet",
  manifest: "/manifest.json",
  icons: {
    icon: "/icons/icon-192x192.png",
    apple: "/icons/icon-512x512.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#4A90E2",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body 
        className={`${Lato.className} ${MontserratAlternates.className}`}
        suppressHydrationWarning={true}
      >
        <div className="pb-20 md:pb-0 min-h-screen">
          {children}
        </div>
        
        {/* Barre de navigation visible uniquement sur mobile */}
        <BottomNav />
      </body>
    </html>
  );
}
