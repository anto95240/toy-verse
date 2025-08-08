import type { Metadata } from "next";
import { Lato as GoogleLato, Montserrat_Alternates } from "next/font/google";
import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css"; // Import des styles nécessaires
config.autoAddCss = false;

import "./globals.css";

const Lato = GoogleLato({
  subsets: ["latin"],
  variable: "--font-text",
  weight: ["400"],
})

const MontserratAlternates = Montserrat_Alternates({
  subsets: ["latin"],
  variable: "--font-title",
  weight: ["400"],
})

export const metadata: Metadata = {
  title: "Toy Verse",
  description: "collection de jouet",
  icons: {
    icon: [
    { url: "/images/favicon.ico" },
    // { url: "/images/favicon.png", sizes: "32x32", type: "image/png" },
  ]
  },
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${Lato.className} ${MontserratAlternates.className}`}>{children}</body>
    </html>
  );
}
