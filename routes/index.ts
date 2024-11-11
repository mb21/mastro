import { Counter } from '../components/Counter.server.ts'
import { TodoList } from '../components/TodoList/TodoList.server.ts'
import { Layout } from '../components/layout/Layout.ts'
import { html, renderToString } from '../libs/html.client.ts'
import { htmlResponse } from '../libs/routes.ts'
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
            <p><a href="${post.slug + '.html' }">${post.data.title}</a></p>
          `)}

          <h2>Client-initialized Counter</h2>
          <my-counter></my-counter>

          <h2>Server-initialized Counter</h2>
          ${Counter()}

          <h2>Todo list</h2>
          ${TodoList()}

          <h2>Tab-Switch</h2>
          <tab-switch></tab-switch>

          <style>
            html {
              font-family: sans-serif;
            }
            h2 {
              margin-top: 2em;
            }
            .hidden {
              display: none;
            }
          </style>
          `
      }),
    )
  )
}
