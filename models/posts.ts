import { extract } from '$std/front_matter/any.ts'

export interface Post {
  content: string;
  data: Record<string, string>;
  slug: string;
}

export const getPost = async (slug: string): Promise<Post> => {
  const text = await Deno.readTextFile(`./data/posts/${slug}.md`)
  const { attrs, body } = extract(text)
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

export const getPostSlugs = async () => {
  const iter = Deno.readDir('./data/posts')
  const files = await Array.fromAsync(iter)
  return files.map(file => file.name.replace('.md', ''))
}
