import { html, unsafeInnerHtml } from './html.ts'

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

export const htmlResponse = (body: string, status = 200, headers?: HeadersInit): Response =>
  new Response(body, {
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
