import { readDir } from 'mastro/fs.ts'
import { readMarkdownFile } from 'mastro/markdown.ts'
import { Html } from "mastro/html.ts";

export interface Post {
  content: Html;
  data: Record<string, string>;
  slug: string;
}

export const getPost = async (slug: string): Promise<Post> => {
  const { content, data } = await readMarkdownFile(`./data/posts/${slug}.md`)
  return {
    content,
    data,
    slug,
  }
}

export const getPosts = async () => {
  const slugs = await getPostSlugs()
  return Promise.all(slugs.map(getPost))
}

export const getPostSlugs = async () =>
  (await readDir('./data/posts')).map(name => name.replace('.md', ''))
