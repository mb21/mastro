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
