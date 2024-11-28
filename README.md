# Mastro

A *m*inimal take on an [*Astro*](https://astro.build)-like MPA web framework.

🚧 While the Mastro server framework is still a work in progress, the client-side part is already very usable: see [**Reactive Mastro**](src/reactive/).

## Philosophy

- No magic. Easy to understand codebase using simple JS functions wherever possible. Favour small, [composable functions](https://mb21.github.io/blog/2021/09/11/composable-abstractions.html).

- Zero client-side JavaScript by default.

- No build step or bundler by default.

- Minimal dependencies (see `deno.json`)

- File-based routing: `routes/` contains files with handler functions and that's the only way. No `.md` files with `layout` frontmatter property, no `.astro`-like-frontmatter-magic, no `.html` files, etc.

- JSON and HTML [route handlers](https://blog.val.town/blog/the-api-we-forgot-to-name/) are uniform. A handler takes a `Request` object (and no props, and hopefully no context).

- Server components are simple JS functions that by convention take a props object.

- For client-side components, see [Reactive Mastro](src/reactive/).

## How to run

`cd examples/blog/`

Start dev server:

    deno run start

Generate static site:

    deno run generate


## TODOs

- Fully implement `src/generate.ts` (SSG) and `src/server.ts` (dev and maybe also prod server)

- publish as package or packages

- Asset handling (on server startup / static site generation?)
  - support something like CSS Modules? Then again, read [this great article by Heydon Pickering](https://www.smashingmagazine.com/2016/11/css-inheritance-cascade-global-scope-new-old-worst-best-friends/) if you want to be convinced otherwise.
  - image resizing

- docs
