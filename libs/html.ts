// deno-lint-ignore ban-types
export type HtmlNode = String | string | number | undefined | null | { type: 'marker'; marker: string; node: HtmlNode | HtmlNode[] }

export const html = (strings: TemplateStringsArray, ...params: Array<HtmlNode | HtmlNode[] | (() => unknown)>) =>
  unsafeInnerHtml(strings.reduce((acc, s, i) => {
    acc += s
    const p = params[i]
    if (typeof p === 'string') {
      // TODO: check for opening `<` and put double quotes around attr
      acc += s.endsWith('=') ? escapeForAttribute(p) : escapeForHtml(p)
    } else if (p === undefined || p === null) {
      // do nothing
    } else if (Array.isArray(p)) {
      acc += p.join('\n')
    } else if (typeof p === 'number') {
      acc += p.toString()
    } else if ('type' in p && p.type === 'marker') {
      if (s.endsWith('>') && strings[i + 1]?.startsWith('<')) {
        // e.g. <div>${client.count()}</div>
        acc = `${acc.slice(0, -1)} data-marker="${p.marker}">${p.node}`
      } else if (s.endsWith('=')) {
        // e.g. <p style=${client.showText()}
        acc = `${acc}"${p.node}" data-marker="${p.marker}" data-attr="${getAttrName(s)}"`
      } else {
        console.warn('We do not support text nodes etc. yet. Encountered at: ', acc)
        acc += p.node
      }
    } else if (typeof p === 'function') {
      const param = p()
      const attrName = getAttrName(s)
      if (attrName?.startsWith('on') && param) {
        if (param && typeof param === 'object' && 'marker' in param) {
          // e.g. <button onClick=${client.inc}>
          acc = `${acc.slice(0, -(attrName.length + 1))}data-marker="${param.marker}"`
        } else {
          console.warn(`Function return ${param} in ${s}`)
        }
      } else {
        console.warn(`Encountered a function for ${attrName}, which doesn't start with 'on' in ${s}.`)
      }
    } else {
      acc += p
    }
    return acc
  }, ''))

// e.g. getAttrName('<div style=') === 'style'
const getAttrName = (s: string) =>
  s.split(' ').pop()?.slice(0, -1)

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
  typeof node === 'object' ? (node?.toString() || '') : ''


const escapeForHtml = (st: string) =>
  st.replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')

const escapeForAttribute = (str: string) =>
  escapeForHtml(str)
    .replaceAll("'", '&#39;')
    .replaceAll('"', '&quot;')
