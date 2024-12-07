import { Layout } from "../components/Layout.ts"
import { html, renderToString } from "mastro/html.ts"
import { htmlResponse } from "mastro/routes.ts"

export const GET = async (): Promise<Response> => {
  const title = "Reactive Mastro demos"

  const examples = (await Array.fromAsync(Deno.readDir('routes')))
    .map(file => file.name)
    .filter(name => name.endsWith('.server.ts') && name !== 'index.server.ts')
    .map(name => name.slice(0, -10))
    .toSorted((a, b) => a > b ? 1 : -1)

  return htmlResponse(
    await renderToString(
      Layout({
        title,
        children: html`
          <h1>${title}</h1>
          <ul>
            ${examples.map(ex => html`
              <li><p><a href=${ex}>${ex}</a></p></li>
            `)}
          </ul>
          `
      }),
    )
  )
}
