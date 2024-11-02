import { expandGlob } from '@std/fs'

import { html, unsafeInnerHtml } from './html.client.ts'
import { isIterable, mapIterable } from './iterable.ts'

export const importMap = async () => {
  const denoImports = JSON.parse(await Deno.readTextFile('deno.json')).imports as Record<string, string>
  const imports = Object.keys(denoImports).filter(k => k.startsWith('client/')).reduce((acc, key) => {
    acc[key] = `./${key}/`
    return acc
  }, {} as Record<string, string>)
  return html`
    <script type="importmap">
      ${unsafeInnerHtml(JSON.stringify({
        imports
      }))}
    </script>
    `
}

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
