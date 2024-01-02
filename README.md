# mastro

**M**inimal, no-dependencies take on an [**Astro**](https://astro.build)-like web framework.

Not production-ready, this is currently an experiment. I just wanted to see what the simplest web framework I could think of would look like that still offered a nice developer experience.

- No dependencies (except Deno's Standard Library).

- No magic. Easy to understand codebase using simple JS functions wherever possible. (That's why we're using JS functions to generate HTML instead of JSX or [HTM](https://github.com/developit/htm).) Favour small, [composable functions](https://mb21.github.io/blog/2021/09/11/composable-abstractions.html).

- File-based routing: `routes/` contains files with handler functions and that's the only way. No `.md` files with `layout` frontmatter property, no `.astro`-like-frontmatter-magic, no `.html` files, etc.

- JSON and HTML [route handlers](https://blog.val.town/blog/the-api-we-forgot-to-name/) are uniform. A handler takes a `Request` object (and no props, and hopefully no context).

- Components are simple JS functions that by convention take a props object.


## TODOs

- Currently, only does static-site generation. Why start with SSG? See [my blog post](https://mb21.github.io/blog/2023/09/18/building-a-modern-website-ssg-vs-ssr-spa-vs-mpa-svelte-vs-solid.html). But the framework is designed so that we can implement `server.ts` easily (hopefully even supporting HTTP streaming), SSG is a special case of SSR with synthetic requests being generated at build time in `generate.ts`.

- Currently, doesn't support any interactive islands. I would have liked to add SolidJs-island support, but seems that would require babel or a similar transpiler. Perhaps Preact is a better fit, as seen in Deno Fresh...

- Asset handling (CSS and images) – perhaps we should support something like CSS Modules and image resizing and do that on server startup / static site generation ?


## How small is it?

Excluding the basic blog contained in this repo, by counting the number of lines in the `libs/` folder we have 154 lines of TypeScript (using [nushell](https://www.nushell.sh/) and `ls libs/**/*.ts | select name | insert linecount { open $in.name | lines | length } | math sum`)
