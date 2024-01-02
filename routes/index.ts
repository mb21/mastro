import { Layout } from '../components/layout/Layout.ts'
import * as h from '../libs/html.ts'
import { htmlResponse } from "../libs/routes.ts";
import { getPosts } from '../models/posts.ts'

export const GET = async (): Promise<Response> => {
  const posts = await getPosts()
  return htmlResponse(
    Layout({
      title: 'My blog',
      children: posts.map(post =>
        h.p(
          h.a(h.attr({ href: post.slug + '.html' }), post.data.title)
        )
      )
    })
  )
}
