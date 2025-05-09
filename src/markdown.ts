import { extractYaml, test } from '@std/front-matter'
import rehypeStringify from "https://esm.sh/rehype-stringify@10.0";
import remarkGfm from "https://esm.sh/remark-gfm@4.0";
import remarkParse from 'https://esm.sh/remark-parse@11.0';
import remarkRehype from 'https://esm.sh/remark-rehype@11.1';
import { unified } from "https://esm.sh/unified@11.0";

import { readTextFile } from "./fs.ts";

export const markdownToHtml = async (value: string) => {
  const { attrs, body } = test(value)
    ? extractYaml(value)
    : { attrs: {}, body: value }
  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
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
