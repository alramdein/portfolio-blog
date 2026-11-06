import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeSlug from "rehype-slug";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeStringify from "rehype-stringify";
import { visit } from "unist-util-visit";
import { toString } from "hast-util-to-string";
import type { Root, Element } from "hast";

function rehypeMermaid() {
  return (tree: Root) => {
    visit(tree, "element", (node: Element, index, parent) => {
      if (node.tagName !== "pre" || !parent || index === undefined) return;
      const code = node.children[0] as Element | undefined;
      const classes = (code?.properties?.className as string[] | undefined) ?? [];
      if (code?.tagName !== "code" || !classes.includes("language-mermaid")) return;
      parent.children[index] = {
        type: "element",
        tagName: "div",
        properties: { className: ["mermaid-block"], dataSource: toString(code) },
        children: [{ type: "element", tagName: "pre", properties: { className: ["mermaid-fallback"] }, children: [{ type: "text", value: toString(code) }] }],
      };
    });
  };
}

function rehypeLazyImages() {
  return (tree: Root) => {
    visit(tree, "element", (node: Element) => {
      if (node.tagName === "img") {
        node.properties.loading = "lazy";
        node.properties.decoding = "async";
      }
    });
  };
}

const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkRehype)
  .use(rehypeMermaid)
  .use(rehypeSlug)
  .use(rehypeLazyImages)
  .use(rehypePrettyCode, {
    theme: { light: "github-light", dark: "github-dark-dimmed" },
    keepBackground: false,
    defaultLang: { block: "plaintext" },
  })
  .use(rehypeStringify);

export async function renderMarkdown(markdown: string): Promise<string> {
  return String(await processor.process(markdown));
}
