import * as h from './html.ts'

export const htmlResponse = (nodes: h.Node[], status = 200, headers?: HeadersInit): Response =>
  new Response(h.render(nodes), {
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
