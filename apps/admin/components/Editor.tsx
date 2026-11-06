"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { Article } from "@blog/core/client";
import { preview, publish, removePost, saveDraft, unpublish, type SaveResult } from "@/app/actions";

type Fields = { title: string; slug: string; excerpt: string; content: string };
type View = "write" | "split" | "preview";

type Props = { id: number; status: "draft" | "published"; initial: Fields; blogUrl: string };

export function Editor({ id, status, initial, blogUrl }: Props) {
  const [fields, setFields] = useState(initial);
  const [saved, setSaved] = useState(initial);
  const [view, setView] = useState<View>("split");
  const [html, setHtml] = useState("");
  const [notice, setNotice] = useState<SaveResult | null>(null);
  const [uploading, setUploading] = useState(false);
  const [pending, startTransition] = useTransition();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const dirty = JSON.stringify(fields) !== JSON.stringify(saved);
  const set = (k: keyof Fields) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = e.target.value;
    setFields((f) => ({ ...f, [k]: value }));
  };

  useEffect(() => {
    if (view === "write") return;
    const t = setTimeout(() => preview(fields.content).then(setHtml), 350);
    return () => clearTimeout(t);
  }, [fields.content, view]);

  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => {
      if (dirty) e.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const runAction = useCallback(
    (fn: () => Promise<SaveResult>) =>
      startTransition(async () => {
        const res = await fn();
        setNotice(res);
        if (res.ok) {
          const next = res.slug ? { ...fields, slug: res.slug } : fields;
          setFields(next);
          setSaved(next);
        }
      }),
    [fields],
  );

  const save = useCallback(() => runAction(() => saveDraft(id, fields)), [runAction, id, fields]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        save();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [save]);

  function insertAtCursor(text: string) {
    const el = textareaRef.current;
    if (!el) return;
    const { selectionStart: s, selectionEnd: e, value } = el;
    const next = value.slice(0, s) + text + value.slice(e);
    setFields((f) => ({ ...f, content: next }));
    requestAnimationFrame(() => {
      el.focus();
      el.selectionStart = el.selectionEnd = s + text.length;
    });
  }

  async function upload(file: File) {
    setUploading(true);
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      const alt = file.name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " ");
      insertAtCursor(`\n![${alt}](${data.url})\n`);
    } catch (e) {
      setNotice({ ok: false, message: (e as Error).message });
    } finally {
      setUploading(false);
    }
  }

  function onPaste(e: React.ClipboardEvent) {
    const file = Array.from(e.clipboardData.files).find((f) => f.type.startsWith("image/"));
    if (file) {
      e.preventDefault();
      upload(file);
    }
  }

  function onDrop(e: React.DragEvent) {
    const file = Array.from(e.dataTransfer.files).find((f) => f.type.startsWith("image/"));
    if (file) {
      e.preventDefault();
      upload(file);
    }
  }

  const isPublished = status === "published";

  return (
    <main className="editor">
      <div className="editor-bar container">
        <div className="editor-status">
          <span className={`chip ${isPublished ? "chip-accent" : ""}`}>{isPublished ? "Published" : "Draft"}</span>
          {dirty ? <span className="muted">Unsaved changes</span> : notice && <span className={notice.ok ? "muted" : "form-error"}>{notice.message}</span>}
        </div>
        <div className="editor-actions">
          <div className="segmented" role="tablist">
            {(["write", "split", "preview"] as View[]).map((v) => (
              <button key={v} type="button" className={view === v ? "active" : ""} onClick={() => setView(v)}>
                {v[0].toUpperCase() + v.slice(1)}
              </button>
            ))}
          </div>
          <Link href={`/posts/${id}/history`} className="btn btn-ghost">History</Link>
          {isPublished && (
            <a href={`${blogUrl}/${saved.slug}`} target="_blank" rel="noreferrer" className="btn btn-ghost">View ↗</a>
          )}
          <button type="button" className="btn btn-ghost" onClick={save} disabled={pending}>Save draft</button>
          <button type="button" className="btn" onClick={() => runAction(() => publish(id, fields))} disabled={pending}>
            {isPublished ? "Update live post" : "Publish"}
          </button>
        </div>
      </div>

      <div className="container editor-meta">
        <input className="title-input" placeholder="Title" value={fields.title} onChange={set("title")} />
        <div className="meta-row">
          <label>
            <span>Slug</span>
            <input value={fields.slug} onChange={set("slug")} placeholder="auto from title" />
          </label>
          <label className="grow">
            <span>Summary</span>
            <input value={fields.excerpt} onChange={set("excerpt")} placeholder="One or two sentences shown under the title and in the post list" />
          </label>
        </div>
      </div>

      <div className={`container editor-panes view-${view}`}>
        {view !== "preview" && (
          <div className="pane">
            <div className="pane-tools">
              <span className="muted">Markdown · paste or drop images · ⌘S to save</span>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => fileRef.current?.click()} disabled={uploading}>
                {uploading ? "Uploading…" : "Add image"}
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif,image/avif"
                hidden
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) upload(f);
                  e.target.value = "";
                }}
              />
            </div>
            <textarea
              ref={textareaRef}
              className="md-input"
              value={fields.content}
              onChange={set("content")}
              onPaste={onPaste}
              onDrop={onDrop}
              spellCheck
              placeholder={"Start writing…\n\n```ts title=\"example.ts\" {2}\nconst a = 1;\nconst b = 2;\n```\n\n```mermaid\nflowchart LR\n  A --> B\n```"}
            />
          </div>
        )}
        {view !== "write" && (
          <div className="pane pane-preview">
            <h1 className="preview-title">{fields.title || "Untitled"}</h1>
            {fields.excerpt && <p className="preview-lede">{fields.excerpt}</p>}
            <Article html={html} />
          </div>
        )}
      </div>

      <div className="container editor-danger">
        {isPublished && (
          <button type="button" className="btn btn-ghost" disabled={pending} onClick={() => runAction(() => unpublish(id))}>
            Unpublish
          </button>
        )}
        <button
          type="button"
          className="btn btn-danger"
          disabled={pending}
          onClick={() => {
            if (confirm("Delete this post and all its versions? This cannot be undone.")) startTransition(() => removePost(id));
          }}
        >
          Delete post
        </button>
      </div>
    </main>
  );
}
