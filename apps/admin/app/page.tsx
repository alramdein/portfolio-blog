import Link from "next/link";
import { formatDate } from "@blog/core/format";
import { AdminHeader } from "@/components/AdminHeader";
import { requireAdmin } from "@/lib/auth";
import { listPosts } from "@/lib/posts";
import { newPost } from "./actions";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  await requireAdmin();
  const posts = await listPosts();
  const totals = posts.reduce((t, p) => ({ views: t.views + p.views, unique: t.unique + p.unique_views }), { views: 0, unique: 0 });

  return (
    <>
      <AdminHeader />
      <main className="container page">
        <div className="page-head">
          <div>
            <h1>Posts</h1>
            <p className="muted">
              {posts.filter((p) => p.status === "published").length} published · {posts.filter((p) => p.status === "draft").length} drafts ·{" "}
              {totals.views.toLocaleString("en-US")} views · {totals.unique.toLocaleString("en-US")} unique
            </p>
          </div>
          <form action={newPost}>
            <button className="btn" type="submit">New post</button>
          </form>
        </div>

        {posts.length === 0 ? (
          <p className="muted">No posts yet. Write the first one.</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Status</th>
                <th className="num">Views</th>
                <th className="num">Unique</th>
                <th className="num">👍</th>
                <th className="num">👎</th>
                <th>Last edited</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((p) => (
                <tr key={p.id}>
                  <td>
                    <Link href={`/posts/${p.id}`} className="row-title">{p.title || "Untitled"}</Link>
                    <span className="row-slug">/{p.slug}</span>
                  </td>
                  <td>
                    <span className={`chip ${p.status === "published" ? "chip-accent" : ""}`}>{p.status === "published" ? "Published" : "Draft"}</span>
                    {p.has_unpublished_changes && <span className="chip chip-warn">Unpublished changes</span>}
                  </td>
                  <td className="num">{p.views.toLocaleString("en-US")}</td>
                  <td className="num">{p.unique_views.toLocaleString("en-US")}</td>
                  <td className="num">{p.likes.toLocaleString("en-US")}</td>
                  <td className="num">{p.dislikes.toLocaleString("en-US")}</td>
                  <td className="muted">{formatDate(p.updated_at, true)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </main>
    </>
  );
}
