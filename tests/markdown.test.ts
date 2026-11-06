import { describe, expect, it } from "vitest";
import { renderMarkdown } from "@blog/core/markdown";
import { readingMinutes, slugify } from "@blog/core/format";

describe("renderMarkdown", () => {
  it("highlights code with title and language", async () => {
    const html = await renderMarkdown('```ts title="a.ts"\nconst x = 1;\n```');
    expect(html).toContain("data-rehype-pretty-code-figure");
    expect(html).toContain('data-language="ts"');
    expect(html).toContain("a.ts");
    expect(html).toContain("--shiki-dark");
  });

  it("turns mermaid blocks into diagram placeholders", async () => {
    const html = await renderMarkdown("```mermaid\nflowchart LR\n  A --> B\n```");
    expect(html).toContain('class="mermaid-block"');
    expect(html).toContain('data-source="flowchart LR\n  A --> B\n"');
    expect(html).not.toContain("data-rehype-pretty-code-figure");
  });

  it("does not pass raw HTML through", async () => {
    const html = await renderMarkdown('hi <script>alert(1)</script> <img src=x onerror="alert(1)">');
    expect(html).not.toContain("<script");
    expect(html).not.toContain("onerror");
  });

  it("lazy-loads images", async () => {
    expect(await renderMarkdown("![a](https://x/y.png)")).toContain('loading="lazy"');
  });
});

describe("format", () => {
  it("slugifies titles", () => {
    expect(slugify("  Hello, Wörld! Go & Postgres ")).toBe("hello-world-go-postgres");
  });

  it("estimates reading time ignoring code", () => {
    expect(readingMinutes("word ".repeat(460))).toBe(2);
    expect(readingMinutes("```\n" + "x ".repeat(5000) + "\n```")).toBe(1);
  });
});
