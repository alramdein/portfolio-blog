import Link from "next/link";
import { formatDate } from "@blog/core/format";
import { AdminHeader } from "@/components/AdminHeader";
import { requireAdmin } from "@/lib/auth";
import { listFeedback } from "@/lib/posts";

export const dynamic = "force-dynamic";

export default async function FeedbackPage() {
  await requireAdmin();
  const items = await listFeedback();

  return (
    <>
      <AdminHeader />
      <main className="container page">
        <div className="page-head">
          <div>
            <h1>Feedback</h1>
            <p className="muted">Written feedback left with a thumbs up or down, newest first.</p>
          </div>
        </div>
        {items.length === 0 ? (
          <p className="muted">No feedback yet.</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th></th>
                <th>Feedback</th>
                <th>Post</th>
                <th>When</th>
              </tr>
            </thead>
            <tbody>
              {items.map((f, i) => (
                <tr key={i}>
                  <td aria-label={f.value === 1 ? "Liked" : "Disliked"}>{f.value === 1 ? "👍" : "👎"}</td>
                  <td className="feedback-text">{f.feedback}</td>
                  <td><Link href={`/posts/${f.post_id}`} className="row-title">{f.post_title || "Untitled"}</Link></td>
                  <td className="muted">{formatDate(f.updated_at, true)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </main>
    </>
  );
}
