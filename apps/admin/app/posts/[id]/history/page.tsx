import Link from "next/link";
import { notFound } from "next/navigation";
import { Article } from "@blog/core/client";
import { formatDate } from "@blog/core/format";
import { renderMarkdown } from "@blog/core/markdown";
import { restore } from "@/app/actions";
import { AdminHeader } from "@/components/AdminHeader";
import { requireAdmin } from "@/lib/auth";
import { getPost, listVersions } from "@/lib/posts";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ v?: string }> };

export default async function History({ params, searchParams }: Props) {
  await requireAdmin();
  const post = await getPost(Number((await params).id));
  if (!post) notFound();
  const versions = await listVersions(post.id);
  const selectedId = Number((await searchParams).v) || versions[0]?.id;
  const selected = versions.find((v) => v.id === selectedId);
  const html = selected ? await renderMarkdown(selected.content) : "";

  return (
    <>
      <AdminHeader />
      <main className="container page">
        <div className="page-head">
          <div>
            <Link href={`/posts/${post.id}`} className="back">← Back to editor</Link>
            <h1>Version history</h1>
            <p className="muted">{post.title || "Untitled"} · {versions.length} versions</p>
          </div>
        </div>
        {versions.length === 0 ? (
          <p className="muted">No versions yet. A version is saved every time you save a change.</p>
        ) : (
          <div className="history">
            <ol className="version-list">
              {versions.map((v, i) => (
                <li key={v.id}>
                  <Link href={`?v=${v.id}`} className={`version ${v.id === selectedId ? "active" : ""}`}>
                    <span>{formatDate(v.created_at, true)}</span>
                    <span className="version-tags">
                      {i === 0 && <span className="chip">Latest</span>}
                      {v.id === post.published_version_id && post.status === "published" && <span className="chip chip-accent">Live</span>}
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
            {selected && (
              <section className="card version-view">
                <div className="version-view-head">
                  <h2>{selected.title || "Untitled"}</h2>
                  <form action={restore.bind(null, post.id, selected.id)}>
                    <button className="btn btn-ghost" type="submit">Restore to editor</button>
                  </form>
                </div>
                {selected.excerpt && <p className="muted">{selected.excerpt}</p>}
                <Article html={html} />
              </section>
            )}
          </div>
        )}
      </main>
    </>
  );
}
