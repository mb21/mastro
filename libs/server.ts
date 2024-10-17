import tsBlankSpace from 'ts-blank-space'

Deno.serve(async req => {
  const url = new URL(req.url)
  const { pathname } = url
  if (pathname === '/') {
    return Response.redirect('http://localhost:8000/index.html')
  }

  try {
    if ((pathname.startsWith('/components/') || pathname.startsWith('/libs/'))
        && !pathname.endsWith('.server.ts')) {
      const filePath = pathname.slice(1)
      const text = await Deno.readTextFile(filePath)
      return new Response(tsBlankSpace(text), {
        headers: { 'Content-Type': 'text/javascript' },
      })
    } else {
      // TODO: handle slugs aka route params
      const filePath = pathname.endsWith('.html')
        ? `../routes${pathname.slice(0, -5)}.ts`
        : `../routes${pathname}`
      const { GET } = await import(filePath)
      return GET(req)
    }
  } catch (e) {
    if (pathname !== '/favicon.ico') {
      console.warn(e)
    }
    if (e.name === 'NotFound' || e.code === 'ERR_MODULE_NOT_FOUND') {
      return new Response('404 not found', { status: 404 })
    } else {
      return new Response(e.name, { status: 500 })
    }
  }
})
