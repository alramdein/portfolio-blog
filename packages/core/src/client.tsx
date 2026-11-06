"use client";

import { useEffect, useRef, useState } from "react";

export const themeInitScript = `try{var t=localStorage.getItem("theme");document.documentElement.dataset.theme=t==="dark"?"dark":"light"}catch(e){document.documentElement.dataset.theme="light"}`;

function currentTheme(): "light" | "dark" {
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark" | null>(null);
  useEffect(() => setTheme(currentTheme()), []);

  function toggle() {
    const next = currentTheme() === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem("theme", next);
    } catch {}
    setTheme(next);
  }

  return (
    <button type="button" className="icon-btn" onClick={toggle} aria-label="Toggle dark mode" title="Toggle dark mode">
      {theme === "dark" ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" /></svg>
      )}
    </button>
  );
}

let mermaidSeq = 0;

async function renderMermaid(root: HTMLElement) {
  const blocks = Array.from(root.querySelectorAll<HTMLElement>(".mermaid-block[data-source]"));
  if (blocks.length === 0) return;
  const mermaid = (await import("mermaid")).default;
  const dark = currentTheme() === "dark";
  mermaid.initialize({
    startOnLoad: false,
    securityLevel: "strict",
    theme: dark ? "dark" : "neutral",
    fontFamily: "Poppins, system-ui, sans-serif",
  });
  for (const block of blocks) {
    try {
      const { svg } = await mermaid.render(`mermaid-${++mermaidSeq}`, block.dataset.source!);
      block.innerHTML = svg;
      block.classList.remove("mermaid-error");
    } catch {
      block.classList.add("mermaid-error");
    }
  }
}

function addCopyButtons(root: HTMLElement) {
  root.querySelectorAll<HTMLElement>("figure[data-rehype-pretty-code-figure]").forEach((fig) => {
    if (fig.querySelector(".copy-btn")) return;
    const pre = fig.querySelector("pre");
    if (!pre) return;
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "copy-btn";
    btn.textContent = "Copy";
    btn.addEventListener("click", async () => {
      await navigator.clipboard.writeText(pre.innerText);
      btn.textContent = "Copied";
      setTimeout(() => (btn.textContent = "Copy"), 1500);
    });
    fig.appendChild(btn);
  });
}

/** Renders server-generated article HTML and adds mermaid diagrams + copy buttons. */
export function Article({ html, className = "prose" }: { html: string; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    addCopyButtons(el);
    renderMermaid(el);
    const observer = new MutationObserver(() => renderMermaid(el));
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => observer.disconnect();
  }, [html]);

  return <div ref={ref} className={className} dangerouslySetInnerHTML={{ __html: html }} />;
}
