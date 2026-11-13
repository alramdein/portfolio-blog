import type { Metadata } from "next";
import Link from "next/link";
import { ThemeToggle, themeInitScript } from "@blog/core/client";
import "@blog/core/styles/theme.css";
import "@blog/core/styles/prose.css";
import "./blog.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "Alif Ramdani — Blog", template: "%s — Alif Ramdani" },
  description: "Stories from building things, and my thoughts along the way.",
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
              <ThemeToggle />
            </nav>
          </div>
        </header>
        <main>{children}</main>
        <footer className="site-footer">
          <div className="container">
            <span>© {new Date().getFullYear()} Alif Ramdani</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
