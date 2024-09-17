import { Layout } from '../components/layout/Layout.ts'
import { html, renderHtmlDoc } from '../libs/html.ts'
import { htmlResponse } from "../libs/routes.ts";
import { getPosts } from '../models/posts.ts'

export const GET = async (): Promise<Response> => {
  const posts = await getPosts()
  const title = 'My blog'
  return htmlResponse(
    renderHtmlDoc({
      body:
        Layout({
          title,
          children: posts.map(post => html`
            <p>
              <a href="${post.slug + '.html' }">${post.data.title}</a>
            </p>
            `)
        }),
      title,
      lang: 'en',
    })
  )
}
