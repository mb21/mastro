import { Layout } from "../components/layout/Layout.ts";
import { StaticPath } from "../libs/generate.ts";
import { html, renderToString } from '../libs/html.client.ts'
import { htmlResponse } from "../libs/routes.ts";
import { getPost, getPostSlugs } from '../models/posts.ts'

export const GET = async (req: Request): Promise<Response> => {
  const post = await getPost(getSlug(req.url) || '')
  const title = post.data.title + ' | My blog'
  return htmlResponse(
    await renderToString(
      Layout({
        title,
        children: html`
          <article>
            <h2>${post.data.title}</h2>
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
  url.split('/').at(-1)
