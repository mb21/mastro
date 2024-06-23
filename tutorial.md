Directory structure:

```
- components/ // functions that take `Props` and return `JSX`
- data/       // json, yaml, md files (stuff that might just as well come from a CMS)
- pages/      // files to be served verbatim and
              // functions that take a `Request` and return a `Response`
              // should pages/ be renamed to public/ ?
```

This tutorial teaches you the basics of HTML, CSS and JavaScript – the core web technologies. We use the Mastro framework – a minimal server and static site generator that follows the philosophy of KISS (keep it simple stupid): no bundler, no magic, nothing auto-injected into your page, leveraging native browser functionality instead of reinventing the wheel with JavaScript – all while still providing a modern developer experience.

## Content in HTML

The simplest Mastro website is a single HTML file placed in `pages/index.html`:

```html
<!DOCTYPE html>
<html>
  <head>
    <title>My website</title>
  </head>
  <body>
    Hello world!
  </body>
</html>
```

All files in the `pages/` folder are sent out unmodified to your website's visitors – except for JavaScript files ending in `.server.js` etc. (the code in those is executed by the server).

Start the server with `deno run server` and open `http://localhost:3000` in your browser to see your `index.html` file in action. Note how the text in the `<title>` is shown as the tab name in your browser.

When creating a new page, always start with the HTML. It's the foundation. Later you can add CSS to make it look nice, and maybe JavaScript to make it interactive. But always start with the content. Let's add some:

```html
<!DOCTYPE html>
<html>
  <head>
    <title>My website</title>
  </head>
  <body>
    <h1>What is Structured Content?</h1>
    <p>Let's go through the most important HTML elements to structure your content.</p>

    <h2>Paragraphs</h2>
    <p>The <code>p</code> element marks a paragraph of text.</p>

    <h2>Headings</h2>
    <p>
      At the very top, we have the heading of this page in a <code>h1</code> element.
      This is what search engines (like Google) and screen readers (used by visually impaired readers)
      look for when they want to know what the page's title is.
      Therefore, you should only ever have one <code>h1</code> element on any given page.
    </p>
    <p>
      The <code>h2</code> element is a sub-heading. HTML has <code>h1</code> up to <code>h6</code>
      elements, which you should use to mark the structure of your page (like a table of contents).
    </p>

    <h2>Lists</h2>
    <p>Let's add a ordered list:<p>
    <ol>
      <li>list item one</li>
      <li>list item two</li>
      <li>list item three</li>
    </ol>
    <p>and an unordered list:<p>
    <ul>
      <li>list item one</li>
      <li>list item two</li>
      <li>list item three</li>
    </ul>

    <h2>Images</h2>
    <p>Finally, let's add an image:</p>
    <p><img src="table.jpg" alt="A table" ></p>
    <p>
      Note the <code>alt</code> attribute on the image, which contains alternative text that is
      read to visually impaired readers that cannot see the image or shown if the image cannot
      be loaded by the browser. If the image is relevant content, the alt text should therefore
      describe what's on the image. If the image is just decoration, you should use <code>alt=""</code.
    </p>
  </body>
</html>
```

## Styles in CSS

Now that you got the content right with HTML, you can link to a CSS style sheet to style your page:

```html
<!DOCTYPE html>
<html>
  <head>
    <title>My website</title>
    <link rel="stylesheet" href="styles.css">
  </head>
  <body>
    ...
  </body>
</html>
```

In `pages/styles.css`, add the following CSS:

```css
body {
  font-family: Georgia, serif;
  font-size: 18px;
  max-width: 80em;
  margin: 0 auto;
}
```


## Header and Footer

Most websites have a header and footer. Add them:


```html
<!DOCTYPE html>
<html>
  <head>
    <title>My website</title>
    <link rel="stylesheet" href="styles.css">
  </head>
  <body>
    <header>
      <img src="logo.svg" alt="Mastro logo">
      My awesome website
    </header>

    <main>
      <h1>What is Structured content?</h1>
      ...
    </main>

    <footer>
      Check out this page's <a href="https://github.com/mb21/mastro">source on GitHub</a>.
    </footer>
  </body>
</html>
```

Add some more CSS at the bottom of the `pages/styles.css` file:

```css
header {
}
main {
}
footer {
}
```


## A second page

So far the website still consists of only a single page: the home page. add a second page by creating a new file: `pages/news.html`. You _could_ add the same `header` and `footer` all over again in this second file. But the more pages you add, the more tedious this approach becomes. And when you modify the header or footer in one file, it's easy to forget changing all other files. The solution is to move the header and footer to their own reusable _components_.

### Components and JSX

Move the `<header>` and its contents to a new file `components/header.jsx` and wrap it in a JavaScript function called `Header`:

```jsx
export const Header = () =>
  <header>
    <img src="logo.svg" alt="Mastro logo" />
    My awesome website
  </header>
```

There are a few things going on here:

1.  In case you're not familiar with JavaScript functions, the most concise way to write a function that returns the string `'Hello World'` would be:

    ```js
    () => 'Hello World'
    ```

    To assign the function to the name `hello`, you would write:

    ```js
    const hello = () => 'Hello World'
    ```

    Finally, if you would want to use that function in other files, you need to `export` it by adding the `export` keyword before the `const`:

    ```js
    export const hello = () => 'Hello World'
    ```

2.  A component is also just a function. However, its name needs to be capitalized (`Header` is the name of your component above). And while a component can also return a string, usually a component returns a JSX element. JSX is an extension to the JavaScript language that allows you to write what looks almost like HTML. However, there are slight differences to HTML. One example is the syntax for elements that cannot contain any children (like the `img` element).

    In HTML, these are called _void elements_, which are written as an opening tag without a closing tag:

    ```html
    <img src="image.jpg" alt="A table">
    ```

    In JSX, these elements need to be written as _self-closing tags_ that end in `/>`:

    ```jsx
    <img src="image.jpg" alt="A table" />
    ```

Hopefully, you understand better now why the `Header` component is written the way it is.

Analogous to `components/header.jsx`, create a second file in `components/footer.jsx`:

```jsx
export const Footer = () =>
  <footer>
    Check out this page's <a href="https://github.com/mb21/mastro">source on GitHub</a>.
  </footer>
```

Note that both functions are `export`ed, which allows you to `import` them on the home page. However, to do so, you also need to convert the `pages/index.html` HTML file to JavaScript.


### JavaScript page handlers

Rename the `pages/index.html` file to `pages/index.server.jsx` and change its contents to:

```jsx
import { Header } from '../components/Header.jsx'
import { Footer } from '../components/Footer.jsx'

export const GET = () =>
  <html>
    <head>
      <title>My website</title>
      <link rel="stylesheet" href="styles.css">
    </head>
    <body>
      <Header />

      <main>
        <h1>What is Structured content?</h1>
        ...
      </main>

      <Footer />
    </body>
  </html>
```

Since `<Header />` and `<Footer />` are capitalized, JSX knows these are not HTML elements, but actually function calls.

While you can call components whatever you want, the function you `export` from a `pages/*.server.jsx` file needs to be named `GET`. Otherwise it's not called when your server receives a HTTP `GET` request from the browser for that page. Load the page to see whether it still works!

Now you're almost ready to create that second page. Just one more thing to factor out to its own component: the skeleton of the page. Create a file `components/Layout.jsx`:

```jsx
import { Header } from './Header.jsx'
import { Footer } from './Footer.jsx'

export const Layout = (props) =>
  <html>
    <head>
      <title>{props.title}</title>
      <link rel="stylesheet" href="styles.css">
    </head>
    <body>
      <Header />

      <main>
        {props.children}
      </main>

      <Footer />
    </body>
  </html>
```

The above component is still just a function, but a function that takes one argument: the `props` object (short for properties).

For comparison, a JavaScript function that takes two arguments and adds them together would look like this:

```js
const add = (x, y) => x + y
```

Now you can reduce your `pages/index.server.jsx` file to:

```jsx
import { Layout } from '../components/Layout.jsx'

export const GET = () =>
  <Layout title="Home">
    <h1>What is Structured content?</h1>
    ...
  </Layout>
```

Note how when calling the `Layout` component, the `title` prop looks just like an HTML attribute, while the children can be passed to the component as elements nested between the `Layout` opening and closing tags.

Now finally: add that second page by creating a file `pages/news.server.jsx`:

```jsx
import { Layout } from '../components/Layout.jsx'

export const GET = () =>
  <Layout title="News">
    <h1>News</h1>
    <p>Once we have news, we'll let you know here.</p>
  </Layout>
```


## A blog from markdown files

Now it's time to add some news to that page. One of the simplest ways to create a blog is to create a markdown file for each blog post. When you run the server, each markdown file will be converted to a HTML page. Since the markdown files themselves are not part of the published website, we don't add them to the `pages/` folder, but to the `data/` folder instead. Create a new folder `data/posts/` and in there a file: `data/posts/2024-01-30-hello-world.md` with this text:

```md
---
title: Hello World
date: 2024-01-30
---

This is our first markdown file.

Markdown is just a simpler syntax for the most commonly used HTML elements when writing text.
A blank line marks a new paragraph (HTML `<p>`), and a line starting with `##` is a HTML `<h2>`:

## Lists

For example unordered lists:

- item one
- item two

Or ordered lists:

1. item one
2. item two


## More info

For more information about Markdown, see [CommonMark](https://commonmark.org).
```

And create another file in `data/posts/2024-01-31-second-post.md` with this text:

```md
---
title: Second Post
date: 2024-01-31
---

This is our second blog post.
```

To list all your blog posts, change `pages/news.server.jsx` to:

```jsx
import { readMdFiles } from 'mastro'
import { Layout } from '../components/Layout.jsx'

export const GET = async () => {
  const posts = await readMdFiles('data/posts/*.md')
  return (
    <Layout title="News">
      <h1>News</h1>
      {posts.map(post =>
        <p><a href={post.slug}>{post.data.title}</a></p>)}
    </Layout>
  )
}
```

Note the use of the `readMdFiles` function that we imported from mastro. Because it needs to read the files from disk, it's an `async` function. That's why we need to `await` it, which in turn forces us to mark up our `GET` function as `async` as well.

Have a look at http://localhost:3000/news. Clicking the links will lead you to a page saying 404, not found. Because those pages don't exist yet. Create them by creating the file `pages/news/[slug].server.jsx`. The `[slug]` serves as a wildcard. When your server receives a request for `/news/2024-01-30-hello-world`, the request will be routed to the `news/[slug].server.tsx` page and the `params.slug` variable will be `2024-01-30-hello-world`.

```jsx
import { readMdFile, readMdFiles } from 'mastro'
import { Layout } from '../components/Layout.jsx'

export const GET = async (req, params) => {
  const post = await readMdFile('data/posts/' + params.slug + '.md')
  const { title } = post.data
  return (
    <Layout title={title}>
      <h1>{title}</h1>
      {post.body}
    </Layout>
  )
}
```

Test it on your laptop. Congratulations, you have a working blog!


## Static Site Generation (SSG)

You now have a perfectly good web server running on your laptop, returning dynamic HTML on each request from your browser. But if you want to take this website live and have it running 24/7, you would need to have a server computer running that server program somehwere 24/7 (confusingly, both the computer itself and the program we run on it are both called "server"). This is possible, but often unnecessary.

Instead, you can generate all your html files ahead of time. This is known as static site generation. That way, you don't need to have a server continuously running to execute your code when a request comes in – which means there is no server to update and secure from being hacked. Instead, you just need somebody to serve the html files you generated ahead of time. There are several services that do that for free, and they even place your files in several data centers around the world, so that your user's request will go to the geographically closest one and therefore will load much faster. Such a service is known as a CDN: a content delivery network. Services like GitHub Pages, Netlify or Vercel make it easy to use a CDN.

To pre-generate all your html files, run `bun build`. It will tell you that it generated the `out/index.html` page, but that `pages/news/[slug].server.jsx` is missing a `staticParams` field. That's because mastro can't magically guess all the blog post urls that we want to generate.

To let it know, we import and use the `htmlRoute` function, which takes two arguments:

1. a configuration object (with the slugs to put into the paths to pre-generate), and
2. the function which we already had previously.

Change `pages/news/[slug].server.jsx` to:

```jsx
import { htmlRoute, readMdFile, readMdFiles } from 'mastro'
import { Layout } from '../components/Layout.jsx'

export const GET = htmlRoute(
  {
    staticParams:  await readMdFiles('data/posts/*.md').then(post => ({ slug: post.slug }))
  },
  async (req, params) => {
    const post = await readMdFile('data/posts/' + params.slug + '.md')
    const { title } = post.data
    return (
      <Layout title={title}>
        <h1>{title}</h1>
        {post.body}
      </Layout>
    )
  }
)
```

Run `bun build` again and have a look at the generated files in the `out/` directory. These are ready to be uploaded to a CDN.


## Deploy your static site

1. Create GitHub repo
2. Configure it to [publish your site](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site#creating-a-custom-github-actions-workflow-to-publish-your-site)
3. Push changes and see them deployed


## Images




## Dynamic interactivity with JavaScript in the browser

So far we have a completely static website, meaning it doesn't change no matter what the user does. Unless we website creators change it, the page will always be exactly the same.

Let's add some simple interactivity: When the user loads e.g. `http://localhost:3000/peter`, it should display `Hello peter!`

One way to achieve this is to add some JavaScript that runs in the browser. To make the JavaScript execute when the page is ready, we could either listen to the [`DOMContentLoaded` event](https://developer.mozilla.org/en-US/docs/Web/API/Document/DOMContentLoaded_event#examples), or here we just put the script tag at the end of the body tag:

```html
<!DOCTYPE html>
<html>
  <head>
    <title>My website</title>
    <link rel="stylesheet" href="styles.css">
  </head>
  <body>

    <h1 id="hello">Hello</h1>

    <script>
      // Assign the document's path to the variable `pagePath` (it will contain `/peter`):
      const pagePath = document.location.pathname

      // create a function that takes one argument called `path`, which we expect to be a string,
      // and assign that function to the variable `getName`:
      const getName = (path) => {
        // skips the first character (which will be the slash):
        const name = pagePath.slice(1)

        // add a space before, and a ! after the name,
        // and `return` that from the function:
        return ' ' + name + '!'
      }

      // call the function `getName` with `path` as its argument
      // and assign the returned value to the variable `name` (it will contain ` peter!`):
      const name = getName(path)

      // find the element we already have on the page and append the name to it:
      document.getElementById('hello').append(name)
    </script>
  </body>
</html>
```

**Note**: If that didn't make too much sense or you want to know all the details, I highly recommend reading the first 3 chapters of [Eloquent JavaScript](https://eloquentjavascript.net).

If you're more the experimental learner, open your browser's developer tools, switch to the `Console` tab and try out what happens when you put in some of the code from above. For example try `document.location.pathname` and hit `Enter`.


## HTML generated dynamically by JavaScript on the server

For some things, adding JavaScript that runs in the browser is a fine solution (think interactive widgets like a map). But compared to just displaying HTML, a lot more things have to go completely right for the user's browser to execute that bit of JavaScript without failing. And JavaScript in the browser always executes fairly late (only once the page has been sent over the network and the user's browser got around to executing it). If you reload the page, you can quickly see that the browser first shows `Hello` and only after a split-second updates to `Hello peter!`. Therefore, for lots of things, it's preferable to run the code that makes things dynamic already on our server, and then simply send different HTML to the user. Let's do that.

To match on the name part of the URL and make a dynamic server-generated page, we rename our `index.html` file in the `pages/` folder to `[name].jsx`. The `[...]` syntax acts as a wildcard. The file contains a single variable named `GET`, which is a function. We `export` the `GET` function in order for the server to call it.

```jsx
export const GET = (req) => {
  const url = new URL(req.url)
  const name = url.pathname.slice(1)

  return (
    <html>
      <head>
        <title>My website</title>
        <link rel="stylesheet" href="styles.css">
      </head>
      <body>
        <h1>Hello {name}!</h1>
      </body>
    </html>
  )
}
```

If you place a `.server.js` or `.server.jsx` file in the `pages/` folder, and export a function like `GET` from it, then the mastro server will call that function when the server receives a HTTP GET request from the browser – which is what happens behind the scenes when you visit `http://localhost:3000/peter` with your browser – try it!



<!--
TODO:

- mention that this tutorial is for ppl who also wanna learn JS, not only HTML/CSS
- link to more follow up sites
-->
