import type { Metadata } from "next";
import { Bebas_Neue } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import SiteHeader from "@/components/site/SiteHeader";
import LiveTicker from "@/components/site/LiveTicker";
import TickerGate from "@/components/site/TickerGate";
import Footer from "@/components/Footer";

const display = Bebas_Neue({
  weight: "400",
  subsets: ["latin", "latin-ext"],
  variable: "--font-display",
  display: "swap",
});

const satoshi = localFont({
  src: [
    { path: "./fonts/Satoshi-400.woff2", weight: "400" },
    { path: "./fonts/Satoshi-500.woff2", weight: "500" },
    { path: "./fonts/Satoshi-700.woff2", weight: "700" },
  ],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ŽRK Lavice-UDG Podgorica",
  description: "Ženski rukometni klub Lavice-UDG — razvojni klub za djevojčice, Podgorica, Crna Gora",
  openGraph: {
    title: "ŽRK Lavice-UDG Podgorica",
    description: "Stvaramo nove Lavice — razvojni rukometni klub za djevojčice.",
    url: "https://zrklavice.me",
    siteName: "ŽRK Lavice-UDG",
    locale: "sr_ME",
    images: [{ url: "https://zrklavice.me/og.jpg", width: 1200, height: 630 }],
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sr" className={`h-full ${display.variable} ${satoshi.variable}`}>
      <body className="min-h-full flex flex-col" style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)' }}>
        <a href="#sadrzaj" className="skip-link">Preskoči na sadržaj</a>
        <SiteHeader />
        <TickerGate><LiveTicker /></TickerGate>
        <main id="sadrzaj" className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
