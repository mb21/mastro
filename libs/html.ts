// deno-lint-ignore ban-types
export type HtmlNode = String | string | undefined | null

export const html = (strings: TemplateStringsArray, ...params: Array<HtmlNode | HtmlNode[]>) =>
  unsafeInnerHtml(String.raw({ raw: strings }, ...params.map(p =>
    typeof p === 'string'
      ? escapeForAttribute(p)
      : (p === undefined || p === null
        ? ''
        : (Array.isArray(p) ? p.join('\n') : p)
      )
  )))

export const unsafeInnerHtml = (str: string) =>
  new String(str)

export const renderHtmlDoc = (
  opts: { body: HtmlNode | HtmlNode[]; head?: HtmlNode | HtmlNode[]; lang?: string; title: string }
): string =>
  renderNode(html`
    <!DOCTYPE html>
    <html lang="${opts.lang}">
      <head>
        <meta charset="UTF-8">
        <title>${opts.title}</title>
        ${opts.head}
      </head>
      <body>
        ${opts.body}
      </body>
    </html>
    `)

export const renderNode = (node: HtmlNode): string =>
  node ? node.valueOf() : ''


const escapeForHtml = (st: string) =>
  st.replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')

const escapeForAttribute = (str: string) =>
  escapeForHtml(str)
    .replaceAll("'", '&#39;')
    .replaceAll('"', '&quot;')
