import { html, unsafeInnerHtml } from './html.ts'
import { isIterable } from "./iterable.ts";

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

// TODO: implement this using async and https://docs.deno.com/api/node/fs/~/glob
export const scripts = (pattern: string) => html`
  <script type="module" src="components/Counter.client.ts"></script>
  <script type="module" src="components/TabSwitch.client.ts"></script>
  <script type="module" src="components/TodoList/TodoList.client.ts"></script>
  `

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
