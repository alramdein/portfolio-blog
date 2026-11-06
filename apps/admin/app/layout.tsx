import type { Metadata } from "next";
import { themeInitScript } from "@blog/core/client";
import "@blog/core/styles/theme.css";
import "@blog/core/styles/prose.css";
import "./admin.css";

export const metadata: Metadata = {
  title: "Blog Admin",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="light" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
