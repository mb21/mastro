import { Layout } from "../components/layout/Layout.ts";
import { StaticPath } from "../libs/generate.ts";
import * as h from '../libs/html.ts'
import { htmlResponse } from "../libs/routes.ts";
import { getPost, getPostSlugs } from '../models/posts.ts'

export const GET = async (req: Request): Promise<Response> => {
  const post = await getPost(getSlug(req.url) || '')
  const { title } = post.data
  return htmlResponse(
    Layout({
      title: title + ' | My blog',
      children: [
        h.article(
          h.h2(title),
          h.p(post.content)
        )
      ]
    })
  )
}

export const getStaticPaths = async (): Promise<StaticPath[]> => {
  const slugs = await getPostSlugs()
  return slugs.map(slug => ({ params: { slug } }))
}

const getSlug = (url: string) =>
  url.split('/').at(-1)
