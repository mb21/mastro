import { extractYaml } from '@std/front-matter'
import { readDir, readTextFile } from 'mastro/fs.ts'

export interface Post {
  content: string;
  data: Record<string, string>;
  slug: string;
}

export const getPost = async (slug: string): Promise<Post> => {
  const text = await readTextFile(`./data/posts/${slug}.md`)
  const { attrs, body } = extractYaml(text)
  return {
    content: body,
    data: attrs as Record<string, string>,
    slug,
  }
}

export const getPosts = async () => {
  const slugs = await getPostSlugs()
  return Promise.all(slugs.map(getPost))
}

export const getPostSlugs = async () =>
  (await readDir('./data/posts')).map(name => name.replace('.md', ''))
