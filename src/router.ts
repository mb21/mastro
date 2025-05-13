import { findFiles } from './fs.ts'

if (typeof URLPattern !== "function") {
  throw Error("Please use a browser that implements URLPattern")
}

const pathSegments = []
for (const filePath of await findFiles('routes/**/*.server.{ts,js}')) {
  const segments = filePath.split('/').slice(2).map(segment => {
    const matches = segment.match(/^\[([a-zA-Z0-9]+)\]\.server\.(ts|js)$/)
    if (matches?.[1]) {
      // `[slug].ts` -> `:slug`
      const param = matches[1]
      return ':' + param
    } else if (segment === 'index.server.ts' || segment === 'index.server.js') {
      return
    } else if (segment.endsWith('.server.ts') || segment.endsWith('.server.js')) {
      return segment.slice(0, -10)
    } else {
      return segment
    }
  }).filter(s => s)
  pathSegments.push({ filePath, segments })
}

// TODO: sort this according to solid route precedence criteria
pathSegments.sort((a, b) => a.segments.length - b.segments.length)

export const routes = pathSegments.map(r => ({
  filePath: r.filePath,
  pattern: new URLPattern({ pathname: `/${r.segments.join('/')}` }),
}))

export const matchRoute = (urlPath: string) => {
  for (const route of routes) {
    const match = route.pattern.exec(urlPath)
    if (match) {
      const { filePath } = route
      if (typeof window === 'object' && filePath.endsWith(".server.ts")) {
        throw Error(
          "TypeScript files are currently not supported in the " +
          ` Mastro VSCode extension (${filePath})`
        )
      }
      return {
        filePath,
        params: match.pathname.groups || {}
      }
    }
  }
}
