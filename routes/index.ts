import { Counter } from '../components/Counter.server.ts'
import { TodoList } from '../components/TodoList/TodoList.server.ts'
import { Layout } from '../components/layout/Layout.ts'
import { html, renderNode } from '../libs/html.ts'
import { htmlResponse } from '../libs/routes.ts'
import { getPosts } from '../models/posts.ts'

export const GET = async (): Promise<Response> => {
  const posts = await getPosts()
  const title = 'My blog'
  return htmlResponse(
    renderNode(
      Layout({
        title,
        children: html`
          <h1>My blog</h1>
          ${posts.map(post => html`
            <p><a href="${post.slug + '.html' }">${post.data.title}</a></p>
          `)}

          <h2>Counter</h2>
          ${Counter()}

          <h2>Todo list</h2>
          ${TodoList()}
          `
      }),
    )
  )
}
