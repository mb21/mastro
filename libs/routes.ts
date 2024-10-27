import { expandGlob } from '@std/fs'

import { html, unsafeInnerHtml } from './html.ts'
import { isIterable, mapIterable } from './iterable.ts'

export const importMap = () => html`
  <script type="importmap">
    ${unsafeInnerHtml(JSON.stringify({
      imports: {
        // TODO: for non-npm imports, we should be able to read these out from deno.json#imports
        '@maverick-js/signals': '/libs/vendor/maverick-js/signals/index.js',
      }
    }))}
  </script>
  `

export const scripts = (pattern: string) => {
  const prefix = import.meta.dirname
  if (!prefix) throw Error(`import.meta.dirname undefined in routes.ts`)
  return mapIterable(
    expandGlob(pattern),
    entry => html`
      <script type="module" src=${entry.path.slice(prefix.length - 5)}></script>`,
  )
}

export const htmlResponse = (body: string | AsyncIterable<string>, status = 200, headers?: HeadersInit): Response =>
  new Response(isIterable(body) ? ReadableStream.from(body) : body, {
    status,
    headers: {
      'Content-Type': 'text/html',
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
