import { expandGlob } from '@std/fs'

import { html, unsafeInnerHtml } from './html.ts'

export const importMap = async () => {
  const denoImports = JSON.parse(await Deno.readTextFile('deno.json')).imports as Record<string, string>
  const imports = Object.keys(denoImports).filter(k => k.startsWith('client/')).reduce((acc, key) => {
    acc[key] = `./${key}/`
    return acc
  }, {} as Record<string, string>)
  imports['mastro/reactive'] = '/client/mastro/reactive/reactive.ts'
  return html`
    <script type="importmap">
      ${unsafeInnerHtml(JSON.stringify({
        imports
      }))}
    </script>
    `
}

export const scripts = (pattern: string) => {
  const prefixLength = Deno.cwd().length
  return mapIterable(
    expandGlob(pattern),
    entry => html`
      <script type="module" src=${entry.path.slice(prefixLength)}></script>`,
  )
}

export const htmlResponse = (body: string | AsyncIterable<string>, status = 200, headers?: HeadersInit): Response =>
  new Response(isAsyncIterable(body) ? ReadableStream.from(body) : body, {
    status,
    headers: {
      'Content-Type': 'text/html',
      ...headers,
    },
  })

export const jsResponse = (body: string, status = 200, headers?: HeadersInit): Response =>
  new Response(body, {
    status,
    headers: {
      'Content-Type': 'text/javascript',
      ...headers,
    },
  })

export const jsonResponse = (body: object, status = 200, headers?: HeadersInit): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  })


/**
 * Maps over an `AsyncIterable`, just like you'd map over an array.
 */
async function * mapIterable<T, R> (
  iter: AsyncIterable<T>,
  callback: (val: T, index: number) => R,
): AsyncIterable<R> {
  let i = 0
  for await (const val of iter) {
    yield callback(val, i++)
  }
}

// deno-lint-ignore no-explicit-any
const isAsyncIterable = <T>(val: any): val is AsyncIterable<T> =>
  val && typeof val[Symbol.asyncIterator] === 'function'
