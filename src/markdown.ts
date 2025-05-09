import { extractYaml, test } from '@std/front-matter'
import rehypeStringify from "https://esm.sh/rehype-stringify@10.0";
import remarkGfm from "https://esm.sh/remark-gfm@4.0";
import remarkParse from 'https://esm.sh/remark-parse@11.0';
import remarkRehype from 'https://esm.sh/remark-rehype@11.1';
import remarkPrism from "npm:remark-prism@1.3.6";
import { unified } from "https://esm.sh/unified@11.0";

import { readTextFile } from "./fs.ts";

export const markdownToHtml = async (value: string) => {
  const { attrs, body } = test(value)
    ? extractYaml(value)
    : { attrs: {}, body: value }
  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkPrism, { plugins: ['diff-highlight'] })
    .use(() => root => {
      // add the `diff-highlight` class because if you try to do it
      // in the infostring of the markdown fenced codeblock,
      // it will just end up in the meta field of the ast but not make it as
      // as a class into the html output.
      // see https://prismjs.com/plugins/diff-highlight/ for basic docs
      // TODO: see https://unifiedjs.com/learn/recipe/find-node/ to do this the "proper" way
      root.children.filter(n => n.type === "element" && n.children[0]?.tagName === "pre")
        .forEach(n => {
          const code = n.children[0].children[0]
          if (code?.tagName === "code" && code.properties.className?.startsWith("language-diff-")) {
            code.properties.className += " diff-highlight"
          }
        })
      }
    )
    .use(remarkRehype)
    .use(rehypeStringify)
    .process(body)

  return {
    content: new String(file),
    data: attrs as Record<string, string>,
  };
};

export const readMarkdownFile = async (path: string) =>
  markdownToHtml(await readTextFile(path));
