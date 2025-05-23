import jsYaml from "https://esm.sh/js-yaml@4.1.0";
import { micromark, type Options } from "https://esm.sh/micromark@4.0.2";
import { gfm, gfmHtml } from "https://esm.sh/micromark-extension-gfm@3.0.0";

import { findFiles, readTextFile } from "./fs.ts";
import { unsafeInnerHtml } from "./html.ts";

// from https://github.com/dworthen/js-yaml-front-matter/blob/master/src/index.js#L14
const yamlFrontRe = /^(-{3}(?:\n|\r)([\w\W]+?)(?:\n|\r)-{3})?([\w\W]*)*/

export const markdownToHtml = (md: string, opts?: Options) => {
  const { bodyMd, meta } = parseYamlFrontmatter(md)
  const content = unsafeInnerHtml(
    micromark(bodyMd, {
      extensions: [gfm() as any],
      htmlExtensions: [gfmHtml() as any],
      ...opts,
    }),
  );
  return { content, meta };
};

export const readMarkdownFile = async (path: string, opts?: Options) =>
  markdownToHtml(await readTextFile(path), opts);

export const readMarkdownFiles = async (pattern: string, opts?: Options) => {
  const paths = await findFiles(pattern);
  const files = await Promise.all( paths.map(readTextFile) );
  return files.map((file, i) => ({ path: paths[i], ...markdownToHtml(file, opts)}));
}

const parseYamlFrontmatter = (md: string) => {
  let meta = {}
  let bodyMd = md
  const results = yamlFrontRe.exec(md)
  try {
    const yaml = results?.[2]
    if (yaml) {
      const metaObj = jsYaml.load(yaml, { schema: jsYaml.JSON_SCHEMA })
      if (typeof metaObj === 'object' && !(metaObj instanceof Array) ) {
        bodyMd = results?.[3] || ''
        meta = metaObj
      }
    }
  } catch(e) {
    console.warn("Could not parse YAML", (e as Error).message)
  }
  return { bodyMd, meta }
}
