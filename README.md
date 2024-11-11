# Mastro

A *m*inimal, no-dependencies take on an [*Astro*](https://astro.build)-like MPA web framework.

Not production-ready, this is currently an experiment. I just wanted to see what the simplest web framework I could think of would look like that still offered a nice developer experience.

- No magic. Easy to understand codebase using simple JS functions wherever possible. Favour small, [composable functions](https://mb21.github.io/blog/2021/09/11/composable-abstractions.html).

- No build step for server-side code (so you get clean stack traces). For the development mode, we currently only use [ts-blank-space](https://bloomberg.github.io/ts-blank-space/). Maybe we'll have to add some form of production bundling for client-side code eventually, let's see.

- Minimal dependencies (see `deno.json`)

- File-based routing: `routes/` contains files with handler functions and that's the only way. No `.md` files with `layout` frontmatter property, no `.astro`-like-frontmatter-magic, no `.html` files, etc.

- JSON and HTML [route handlers](https://blog.val.town/blog/the-api-we-forgot-to-name/) are uniform. A handler takes a `Request` object (and no props, and hopefully no context).

- Server components are simple JS functions that by convention take a props object.

- For client-side components, see [Reactive Mastro](libs/reactive.readme.md).

## How to run

Start dev server:

    deno run dev

Generate static site:

    deno run generate


## TODOs

- Fully implement `libs/generate.ts` (SSG) and `libs/server.ts` (dev and maybe also prod server)

- publish as package or packages

- Asset handling (on server startup / static site generation?)
  - support something like CSS Modules? Then again, read [this great article by Heydon Pickering](https://www.smashingmagazine.com/2016/11/css-inheritance-cascade-global-scope-new-old-worst-best-friends/) if you want to be convinced otherwise.
  - image resizing

- docs
