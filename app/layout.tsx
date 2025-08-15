import type { Metadata } from "next";
import { Lato as GoogleLato, Montserrat_Alternates } from "next/font/google";
import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";
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

// Metadata de base
export const metadata: Metadata = {
  title: "Toy Verse",
  description: "collection de jouet",
  icons: {
    icon: "/images/logo.webp"
  },
  manifest: "/manifest.json",
};

// Pour Next.js >= 14 : générer le viewport et themeColor
export const generateViewport = () => ({
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: "no",
});

export const generateThemeColor = () => "#4A90E2";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={`${Lato.className} ${MontserratAlternates.className}`}>
        {children}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ("serviceWorker" in navigator) {
                window.addEventListener("load", function() {
                  navigator.serviceWorker.register("/sw.js")
                    .then(function(registration) {
                      console.log("SW registered: ", registration);
                    })
                    .catch(function(registrationError) {
                      console.log("SW registration failed: ", registrationError);
                    });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
