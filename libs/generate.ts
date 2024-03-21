import { dirname } from '$std/path/mod.ts'
import { walk } from '$std/fs/walk.ts'
import { config } from '../config.ts'
import { filterIterable, mapIterable } from './iterable.ts'

export interface StaticPath {
  params: Record<string, string>;
}

export const routeHandlers = async () => {
  const handlers = []
  for await (const file of walk('routes')) {
    if (file.isFile && !file.isSymlink && file.name.endsWith('.ts')) {
      handlers.push({
        module: await import(`../${file.path}`),
        path: file.path,
      })
    }
  }
  return handlers
}


const generateAll = async () => {
  (await routeHandlers()).forEach(async ({ module, path }) => {
    const { GET, getStaticPaths } = module
    if (typeof GET === 'function') {

      const paths = typeof getStaticPaths === 'function'
        ? replaceParams(path, await getStaticPaths())
        : [ path ]

      paths.forEach(path =>
        generatePage(path, GET)
      )
    } else {
      console.warn(`${path} should export a function named GET`)
    }
  })
}

generateAll()

const generatePage = async (path: string, GET: (req: Request) => Promise<Response>) => {
  const req = new Request(filepathToUrl(path))
  const res: Response = await GET(req)
  const htmlStr = await res.text()

  const fileName = path.replace('routes', 'dist').slice(0, -3) + '.html'
  await Deno.mkdir(dirname(fileName), { recursive: true })
  Deno.writeTextFile(fileName, htmlStr)
}

export const paramRegex = /\[([^\]]+)]/g

const replaceParams = (path: string, staticPaths: StaticPath[]): string[] => {
  const params = path.match(paramRegex) || []
  return staticPaths.map(p =>
    params.reduce((acc, paramWithBrackets) => {
      const param = paramWithBrackets.slice(1, -1)
      return acc.replace(paramWithBrackets, p.params[param])
    }, path)
  )
}

const filepathToUrl = (path: string) => {
  path = path.slice(6, -3) // remove `routes` and `.ts`
  if (path.endsWith('/index')) {
    path = path.slice(0, -5) // '/index' -> '/'
  }
  return config.baseUrl + path
}
