import { extractYaml, test } from "@std/front-matter";
import { micromark, type Options } from "micromark";
import { gfm, gfmHtml } from "micromark-extension-gfm";
import { readTextFile } from "./fs.ts";
import { unsafeInnerHtml } from "./html.ts";

export const markdownToHtml = (md: string, opts?: Options) => {
  const { attrs, body } = test(md, ["yaml"])
    ? extractYaml(md)
    : { attrs: {}, body: md };
  const content = unsafeInnerHtml(
    micromark(body, {
      extensions: [gfm()],
      htmlExtensions: [gfmHtml()],
      ...opts,
    }),
  );
  return {
    content,
    data: attrs as Record<string, string>,
  };
};

export const readMarkdownFile = async (path: string, opts?: Options) =>
  markdownToHtml(await readTextFile(path), opts);
