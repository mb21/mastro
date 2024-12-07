import { walk } from '@std/fs/'

const pathSegments = []
for await (const file of walk('routes')) {
  if (file.isFile && !file.isSymlink && file.name.endsWith('.ts')) {
    const segments = file.path.split('/').slice(1).map(segment => {
      const matches = segment.match(/^\[([a-zA-Z0-9]+)\]\.server\.ts$/)
      if (matches?.[1]) {
        // `[slug].ts` -> `:slug`
        const param = matches[1]
        return ':' + param
      } else if (segment === 'index.server.ts') {
        return
      } else if (segment.endsWith('.server.ts')) {
        return segment.slice(0, -10)
      } else {
        return segment
      }
    }).filter(s => s)
    pathSegments.push({ filePath: file.path, segments })
  }
}

// TODO: sort this according to solid route precedence criteria
pathSegments.sort((a, b) => a.segments.length - b.segments.length)
const routes = pathSegments.map(r => ({
  filePath: r.filePath,
  pattern: new URLPattern({ pathname: `/${r.segments.join('/')}` }),
}))

export const matchRoute = (urlPath: string) => {
  for (const route of routes) {
    const match = route.pattern.exec(urlPath)
    if (match) {
      const { pathname } = match
      return {
        filePath: route.filePath,
        params: pathname.groups || {}
      }
    }
  }
}
