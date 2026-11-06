import type { Metadata } from "next";
import Link from "next/link";
import { ThemeToggle, themeInitScript } from "@blog/core/client";
import "@blog/core/styles/theme.css";
import "@blog/core/styles/prose.css";
import "./blog.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
const portfolioUrl = process.env.NEXT_PUBLIC_PORTFOLIO_URL || "https://www.aliframdani.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "Alif Ramdani — Blog", template: "%s — Alif Ramdani" },
  description: "Notes on backend engineering, distributed systems and the things I build.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="light" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        <header className="site-header">
          <div className="container">
            <Link href="/" className="brand">
              <span className="brand-mark">AR</span>
              <span className="brand-name">
                Alif Ramdani
                <span className="brand-sub">Blog</span>
              </span>
            </Link>
            <nav className="nav">
              <a className="nav-link" href={portfolioUrl}>Portfolio ↗</a>
              <ThemeToggle />
            </nav>
          </div>
        </header>
        <main>{children}</main>
        <footer className="site-footer">
          <div className="container">
            <span>© {new Date().getFullYear()} Alif Ramdani</span>
            <a href={portfolioUrl}>aliframdani.com</a>
          </div>
        </footer>
      </body>
    </html>
  );
}
