"use client";

import { useState } from "react";

type Props = {
  published: string;
  publishedFull: string;
  updated: string | null;
  updatedFull: string | null;
  minutes: number;
  views: number;
  uniqueViews: number;
};

export function PostMeta(p: Props) {
  const [open, setOpen] = useState(false);
  return (
    <div className="post-meta">
      <div className="post-meta-line">
        <span>{p.updated ? `Updated ${p.updated}` : p.published}</span>
        <span aria-hidden>·</span>
        <span>{p.minutes} min read</span>
        <button type="button" className="meta-more" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
          {open ? "Less" : "More"}
        </button>
      </div>
      {open && (
        <dl className="post-meta-details">
          <div><dt>Published</dt><dd>{p.publishedFull}</dd></div>
          {p.updatedFull && <div><dt>Last updated</dt><dd>{p.updatedFull}</dd></div>}
          <div><dt>Views</dt><dd>{p.views.toLocaleString("en-US")}</dd></div>
          <div><dt>Unique readers</dt><dd>{p.uniqueViews.toLocaleString("en-US")}</dd></div>
        </dl>
      )}
    </div>
  );
}
