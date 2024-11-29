import tsBlankSpace from 'ts-blank-space'
import { join } from '@std/path'
import { matchRoute } from './router.ts'
import { jsResponse } from './routes.ts'

export const handler: Deno.ServeHandler = async req => {
  const url = new URL(req.url)
  const { pathname } = url

  try {
    if (pathname.startsWith('/components/') && pathname.endsWith('.client.ts')) {
      const text = await Deno.readTextFile(pathname.slice(1))
      return jsResponse(tsBlankSpace(text))
    } else if (pathname.startsWith('/client/mastro/')) {
      const filePath = import.meta.resolve(pathname.slice('/client/'.length)).slice('file://'.length)
      const text = await Deno.readTextFile(filePath)
      return jsResponse(tsBlankSpace(text))
    } else if (pathname.startsWith('/client/')) {
      const specifier = import.meta.resolve(pathname.slice('/client/'.length))
      const str = await loadDependency(specifier)
      return jsResponse(str)
    } else {
      const route = matchRoute(req.url)
      if (route) {
        const modulePath = Deno.cwd() + '/' + route.filePath
        console.info(`Received ${req.url}, loading ${modulePath}`)
        const { GET } = await import(modulePath)
        return await GET(req)
      } else {
        return new Response('404 not found', { status: 404 })
      }
    }
  } catch (e: any) {
    if (pathname !== '/favicon.ico') {
      console.warn(e)
    }
    if (e.name === 'NotFound' || e.code === 'ERR_MODULE_NOT_FOUND') {
      return new Response('404 not found', { status: 404 })
    } else {
      return new Response(e.name || 'Unknown error', { status: 500 })
    }
  }
}

const loadDependency = async (specifier: string) => {
  // TODO: perhaps instead of `nodeModulesDir` in deno.json
  // we could load files from ~/Library/Caches/deno/ (Deno.cacheDir),
  // maybe use https://jsr.io/@deno/cache-dir

  const { pathname, protocol } = new URL(specifier)
  if (protocol === 'npm:') {
    const [module, path] = pathname.split(/@\d+\.\d+\.\d+/)

    // TEMP hack: because cwd is e.g. /examples/blog/
    const prefix = '../..'

    const moduleDir = `${prefix}/node_modules/${module}`
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
