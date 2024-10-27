import { isIterable, iterableToArray } from './iterable.ts'

// deno-lint-ignore ban-types
type HtmlPrimitive = String | string | number | undefined | null
type HtmlAsync = HtmlPrimitive | AsyncIterable<HtmlPrimitive> | Promise<HtmlPrimitive>
export type Html = HtmlAsync | HtmlAsync[]

export const html = (strings: TemplateStringsArray, ...params: Array<Html | Html[]>): HtmlAsync[] => {
  const output = []
  for (let i = 0; i < strings.raw.length; i++) {
    output.push(unsafeInnerHtml(strings.raw[i]))
    const p = params[i]
    if (Array.isArray(p)) {
      output.push(...p.flat())
    } else {
      output.push(p)
    }
  }
  return output
}

export const unsafeInnerHtml = (str: string) =>
  // we're using a string object to mark something as HTML
  // (as opposed to a string that still needs to be escaped)
  // we could also use a plain object like `{ type: 'html', str }`
  // but the String object's `.toString()` and `.valueOf()` behaviour are handy.
  new String(str)

export async function * renderToStream (node: Html): AsyncIterable<string> {
  if (Array.isArray(node)) {
    for (let i = 0; i < node.length; i++) {
      yield* renderToStream(node[i])
    }
  } else if (isIterable(node)) {
    for await (const n of node) {
      yield* renderToStream(n)
    }
  } else {
    const n = await node
    yield escape(n)
  }
}

export const renderToString = async (node: Html): Promise<string> =>
  (await iterableToArray(renderToStream(node))).join('')

const escape = (n: HtmlPrimitive): string =>
  typeof n === 'string'
    ? escapeForAttribute(n)
    : (n === undefined || n === null
      ? ''
      : n.toString()
      )

const escapeForHtml = (st: string) =>
  st.replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')

const escapeForAttribute = (str: string) =>
  escapeForHtml(str)
    .replaceAll("'", '&#39;')
    .replaceAll('"', '&quot;')
