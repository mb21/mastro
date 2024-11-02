import tsBlankSpace from 'ts-blank-space'
import { join } from '@std/path'
import { jsResponse } from "./routes.ts";

Deno.serve(async req => {
  const url = new URL(req.url)
  const { pathname } = url
  if (pathname === '/') {
    return Response.redirect('http://localhost:8000/index.html')
  }

  try {
    if ((pathname.startsWith('/components/') || pathname.startsWith('/libs/'))
        && pathname.endsWith('.client.ts')) {
      const filePath = pathname.slice(1)
      const text = await Deno.readTextFile(filePath)
      return jsResponse(tsBlankSpace(text))
    } else if (pathname.startsWith('/client/')) {
      const specifier = import.meta.resolve(pathname.slice(1))
      const str = await loadModule(specifier)
      return jsResponse(str)
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

const loadModule = async (specifier: string) => {
  // TODO: perhaps instead of `nodeModulesDir` in deno.json
  // we could load files from ~/Library/Caches/deno/ (Deno.cacheDir),
  // maybe use https://jsr.io/@deno/cache-dir

  const { pathname, protocol } = new URL(specifier)
  if (protocol === 'npm:') {
    const [module, path] = pathname.split(/@\d+\.\d+\.\d+/)
    const moduleDir = `node_modules/${module}`
    const pkg = JSON.parse(await Deno.readTextFile(`${moduleDir}/package.json`))

    // TODO: also support https://nodejs.org/api/packages.html#main
    // see https://nodejs.org/api/packages.html#exports
    const entryPoint = pkg.exports['.'].default

    const filePath = path === '/'
      ? join(moduleDir, entryPoint)
      : join(moduleDir, entryPoint, path).replaceAll('index.js/', '')

    return Deno.readTextFile(filePath)
  } else {
    throw Error('TODO: implement deno module resolution')
  }
}
