import { dirname } from '$std/path/mod.ts';
import { walk } from '$std/fs/walk.ts'
import { ensureDir } from '$std/fs/ensure_dir.ts'
import { config } from '../config.ts'

export interface StaticPath {
  params: Record<string, string>;
}

const generateAll = async () => {
  for await (const file of walk('routes')) {
    if (file.isFile && !file.isSymlink && !file.name.startsWith('.')) {
      if (file.name.endsWith('server.tsx')) {
        const { GET, getStaticPaths } = await import(`../${file.path}`)
        if (typeof GET === 'function') {

          const paths = typeof getStaticPaths === 'function'
            ? replaceParams(file.path, await getStaticPaths())
            : [ file.path ]

          paths.forEach(path =>
            generatePage(path, GET)
          )
        } else {
          console.warn(`${file.path} should export a function named GET`)
        }
      } else {
        const outPath = file.path.replace('routes', 'dist')
        await ensureDir(dirname(outPath))
        Deno.copyFile(file.path, outPath)
      }
    }
  }
}

generateAll()

const generatePage = async (path: string, GET: (req: Request) => Promise<Response>) => {
  const req = new Request(filepathToUrl(path))
  const res: Response = await GET(req)
  const htmlStr = await res.text()

  const fileName = path.replace('routes', 'dist').slice(0, -11) + '.html'
  await Deno.mkdir(dirname(fileName), { recursive: true })
  Deno.writeTextFile(fileName, htmlStr)
  console.log(fileName + ':', htmlStr)
}

const replaceParams = (path: string, staticPaths: StaticPath[]): string[] => {
  const params = path.match(/\[([^\]]+)]/g) || []
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
