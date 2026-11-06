import { ThemeToggle } from "@blog/core/client";
import Link from "next/link";
import { logout } from "@/app/actions";

export function AdminHeader() {
  const blogUrl = process.env.NEXT_PUBLIC_BLOG_URL || "http://localhost:3000";
  return (
    <header className="site-header">
      <div className="container">
        <Link href="/" className="brand">
          <span className="brand-mark">AR</span>
          <span className="brand-name">
            Alif Ramdani
            <span className="brand-sub">Blog admin</span>
          </span>
        </Link>
        <nav className="nav">
          <a className="nav-link" href={blogUrl} target="_blank" rel="noreferrer">View blog ↗</a>
          <ThemeToggle />
          <form action={logout}>
            <button className="btn btn-ghost" type="submit">Log out</button>
          </form>
        </nav>
      </div>
    </header>
  );
}
