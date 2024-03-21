export type HtmlNode = HtmlElement | string

interface HtmlElement {
  attr?: Attr;
  children?: HtmlNode[];
  elName: string;
  type: 'element';
}

type Attr = Record<string, string | undefined>

/**
 * `h(elementName, attribute)` returns a function, which can be called with children to construct an HTML element.
 *
 * Example usage:
 * ```
 * renderHtmlDoc({
 *   body: [
 *     h('p')(
 *       'my text with a ',
 *       h('a', { href: '/foo' })('link'),
 *     )
 *   ],
 *   title: 'my page'
 * })
 * ```
 */
export const h = (elName: string, attr?: Attr) =>
  (...children: HtmlNode[]): HtmlElement => ({
    type: 'element',
    elName,
    attr,
    children,
  })

/**
 * Render an array of nodes to a string with a doctype.
 */
export const renderHtmlDoc = (opts: { body: HtmlNode[]; head?: HtmlNode[]; lang?: string; title: string }) =>
  '<!DOCTYPE html>' + '\n' +
  renderHtmlSnippet([
    h('html', { lang: opts.lang })(
      h('head')(
        h('meta', { charset: 'UTF-8' })(),
        h('title')(opts.title),
        ...opts.head || [],
      ),
      h('body')(...opts.body),
    ),
  ])

/**
 * Render an array of nodes to a string without a doctype.
 */
export const renderHtmlSnippet = (nodes: HtmlNode[]): string =>
  nodes.map(renderNode).join('\n')

const renderNode = (node: HtmlNode): string => {
  if (typeof node === 'string') {
    return escapeForHtml(node)
  } else {
    const { elName, attr = {}, children = [] } = node
    const kvs = Object.entries(attr)
      .flatMap(([key, val]) => val === undefined ? [] : `${escapeForHtml(key)}="${escapeForAttribute(val)}"`)
    const attributes = kvs.length > 0 ? (' ' + kvs.join(' ')) : ''
    const closingTag = voidElements.includes(elName) ? '' : `</${elName}>`
    return `<${elName}${attributes}>${children.map(renderNode).join('')}${closingTag}`
  }
}

const escapeForHtml = (st: string) =>
  st.replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')

const escapeForAttribute = (str: string) =>
  escapeForHtml(str)
    .replaceAll("'", '&#39;')
    .replaceAll('"', '&quot;')

const voidElements = [
  'area',
  'base',
  'br',
  'col',
  'embed',
  'hr',
  'img',
  'input',
  'link',
  'meta',
  'source',
  'track',
  'wbr',
]
