// deno-lint-ignore ban-types
export type HtmlNode = String | string | number | undefined | null

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
  // we're using a string object to mark something as HTML
  // (as opposed to a string that still needs to be escaped)
  // we could also use a plain object like `{ type: 'html', str }`
  // but the String object's `.toString()` and `.valueOf()` behaviour are handy.
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
  node?.toString() || ''


const escapeForHtml = (st: string) =>
  st.replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')

const escapeForAttribute = (str: string) =>
  escapeForHtml(str)
    .replaceAll("'", '&#39;')
    .replaceAll('"', '&quot;')
