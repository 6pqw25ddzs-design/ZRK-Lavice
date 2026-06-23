import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "ZRK Lavice",
  description: "Ženski rukometni klub Lavice – Podgorica, Crna Gora",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sr" className="h-full">
      <body className="min-h-full flex flex-col" style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)' }}>
        <Navbar />
        <main className="flex-1">{children}</main>
        <footer style={{ backgroundColor: 'var(--card)', borderTop: '1px solid var(--border)' }} className="py-6 text-center text-sm" >
          <span style={{ color: 'var(--text-muted)' }}>© 2026 ZRK Lavice · Podgorica, Crna Gora</span>
        </footer>
      </body>
    </html>
  );
}
