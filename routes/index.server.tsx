import { Layout } from '../components/layout/Layout.tsx'
import { renderToString } from 'preact-render-to-string'
import { htmlResponse } from "../libs/routes.ts";
import { getPosts } from '../models/posts.ts'
import { Counter } from "../components/Counter.tsx";

export const GET = async (): Promise<Response> => {
  const posts = await getPosts()
  const title = 'My blog'
  return htmlResponse(
    renderToString(
      <Layout title={title}>
        <Counter />
        <ul>
          {posts.map(post =>
            <li><a href={post.slug + '.html' }>{post.data.title}</a></li>
          )}
        </ul>
      </Layout>
    )
  )
}
