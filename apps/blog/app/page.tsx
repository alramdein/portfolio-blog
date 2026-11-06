import Link from "next/link";
import { formatDate, readingMinutes } from "@blog/core/format";
import { listPublished } from "@/lib/posts";

export const dynamic = "force-dynamic";

export default async function Home() {
  const posts = await listPublished();
  return (
    <div className="container home">
      <section className="home-hero">
        <span className="chip chip-accent"><span className="dot" /> Writing</span>
        <h1>Notes from the backend.</h1>
        <p className="muted">Distributed systems, databases, and what I learn shipping them.</p>
      </section>
      {posts.length === 0 ? (
        <p className="muted empty">Nothing published yet.</p>
      ) : (
        <ul className="post-list">
          {posts.map((p) => (
            <li key={p.id}>
              <Link href={`/${p.slug}`} className="post-card">
                <div className="post-card-meta">
                  <time dateTime={new Date(p.published_at).toISOString()}>{formatDate(p.published_at)}</time>
                  <span aria-hidden>·</span>
                  <span>{readingMinutes(p.content)} min read</span>
                </div>
                <h2>{p.title}</h2>
                {p.excerpt && <p>{p.excerpt}</p>}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
