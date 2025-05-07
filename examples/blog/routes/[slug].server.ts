import { Layout } from "../components/layout/Layout.ts"
import { StaticPath } from "mastro/generate.ts"
import { html, renderToString } from "mastro/html.ts"
import { htmlResponse } from "mastro/routes.ts"
import { getPost, getPostSlugs } from "../models/posts.ts"

export const GET = async (req: Request): Promise<Response> => {
  const post = await getPost(getSlug(req.url) || '')
  const title = post.meta.title + ' | My blog'
  return htmlResponse(
    await renderToString(
      Layout({
        title,
        children: html`
          <article>
            <h2>${post.meta.title}</h2>
            <p>${post.content}</p>
          </article>
          `
      }),
    )
  )
}

export const getStaticPaths = async (): Promise<StaticPath[]> => {
  const slugs = await getPostSlugs()
  return slugs.map(slug => ({ params: { slug } }))
}

const getSlug = (url: string) =>
  url.split('/').at(-1)?.slice(0, -5)
