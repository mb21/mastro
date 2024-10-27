import { iterableToArray } from "./iterable.ts";
import { createIterable, isIterable, mapIterable } from './iterable.ts'

// deno-lint-ignore ban-types
type HTMLPrimitive = String | string | number | undefined | null
export type HtmlParam = HTMLPrimitive | HTMLPrimitive[] | AsyncIterable<HTMLPrimitive> | Promise<HTMLPrimitive>

// deno-lint-ignore ban-types
export const html = (strings: TemplateStringsArray, ...params: HtmlParam[]): String | AsyncIterable<String> =>
// export const html = <T extends HtmlNode>(strings: TemplateStringsArray, ...params: T[]): T extends HTMLPrimitive | HTMLPrimitive[] ? String : AsyncIterable<String> =>
  params.some(p => isIterable(p) || isPromise(p))
    ? htmlAsync(strings, params)
    : htmlSync(strings, params as Array<HTMLPrimitive | HTMLPrimitive[]>)

async function * htmlAsync (strings: TemplateStringsArray, params: HtmlParam[]) {
  for (let i = 0; i < strings.raw.length; i++) {
    yield unsafeInnerHtml(strings.raw[i])
    yield* mapIterable(
      createIterable(params[i]),
      node => unsafeInnerHtml(toHtml(node)),
    )
  }
}

const htmlSync = (strings: TemplateStringsArray, params: Array<HTMLPrimitive | HTMLPrimitive[]>) =>
  unsafeInnerHtml(String.raw({ raw: strings }, ...params.map(toHtml)))

const toHtml = (p: HTMLPrimitive | HTMLPrimitive[]) =>
  typeof p === 'string'
    ? escapeForAttribute(p)
    : (p === undefined || p === null
      ? ''
      : (Array.isArray(p) ? p.join('') : p.toString())
      )

export const unsafeInnerHtml = (str: string) =>
  // we're using a string object to mark something as HTML
  // (as opposed to a string that still needs to be escaped)
  // we could also use a plain object like `{ type: 'html', str }`
  // but the String object's `.toString()` and `.valueOf()` behaviour are handy.
  new String(str)

export const renderToStream = (node: HtmlParam): AsyncIterable<string> =>
  mapIterable(
    isIterable(node) ? node : createIterable(node),
    toString,
  )

export const renderToString = async (node: HtmlParam): Promise<string> =>
  toString(
    await (isIterable(node)
      ? iterableToArray(node)
      : node)
  )

const toString = (node: HTMLPrimitive | HTMLPrimitive[]): string =>
  Array.isArray(node)
    ? node.join('')
    : (node?.toString() || '')

const escapeForHtml = (st: string) =>
  st.replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')

const escapeForAttribute = (str: string) =>
  escapeForHtml(str)
    .replaceAll("'", '&#39;')
    .replaceAll('"', '&quot;')

const isPromise = <T>(val: any): val is Promise<T> =>
  val && typeof val.then === 'function'
