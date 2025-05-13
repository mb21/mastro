import { Layout } from '../components/layout/Layout.ts'
import { html, renderToString } from 'mastro/html.ts'
import { htmlResponse } from 'mastro/routes.ts'
import { getPosts } from '../models/posts.ts'

export const GET = async (): Promise<Response> => {
  const posts = await getPosts()
  const title = 'My blog'
  return htmlResponse(
    await renderToString(
      Layout({
        title,
        children: html`
          <h1>My blog</h1>
          ${posts.map(post => html`
            <p><a href=${post.slug}>${post.meta.title}</a></p>
          `)}

          <style>
            html {
              font-family: sans-serif;
            }
            h2 {
              margin-top: 2em;
            }
          </style>
          `
      }),
    )
  )
}
