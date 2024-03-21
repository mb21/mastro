import { paramRegex, routeHandlers } from './generate.ts'

const handlers = (await routeHandlers()).map(h => {
  h.path
  return { regex, module: h.module }
})

const server = async (req: Request): Promise<Response> => {
  const path = new URL(req.url).pathname
  const handler = handlers.find(h => path.match(h.regex))
  if (handler) {
    return handler.module.GET(req)
  } else {
    return new Response(null, { status: 404 })
  }
}

Deno.serve(server)
