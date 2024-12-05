# Reactive Mastro

A tiny ([2.7kB minzipped](https://bundlephobia.com/package/mastro)) reactive GUI library for your existing MPA. Reactive Mastro sits somewhere in between React/Vue/Solid/Svelte one one end, and Alpine/HTMX/Stimulus on the other end – while being smaller and simpler than all of them.

Reactive Mastro was conceived as the client-side part of [Mastro](https://github.com/mb21/mastro/), but you can just as well use it with any other static site or server that renders HTML (such as Rails, Django, PHP, etc).

Server-side part is plain HTML:

```html
<my-counter>
  Count is <span data-bind="count">0</span>
  <button data-onclick="inc">+</button>
</my-counter>
```

Client-side part is plain JavaScript:

```js
import { ReactiveElement, signal } from "mastro/reactive"

customElements.define("my-counter", class extends ReactiveElement {
  count = signal(0)

  inc () {
    this.count.set(c => c + 1)
  }
})
```

For more examples, see [components/](../../examples/blog/components/), this [Todo list CodePen](https://codepen.io/mb2100/pen/EaYjRvW), or continue reading.

See below for docs on the syntax of the only two attributes you'll have to learn to use Reactive Mastro: [`data-bind`](#data-bind) and [`data-on*`](#data-on).

## Installation

### Bundling yourself

If your project uses a bundler, you can add the `mastro` package as a dependency:

    npm install mastro

Using the [Astro framework](https://astro.build/) for example, you can then use it in a `.astro` component like:

```html
<my-counter>
  Count is <span data-bind="count">0</span>
  <button data-onclick="inc">+</button>
</my-counter>

<script>
  import { ReactiveElement, signal } from "mastro/reactive"

  customElements.define("my-counter", class extends ReactiveElement {
    count = signal(0)
    inc () {
      this.count.set(c => c + 1)
    }
  })
</script>
```

(This will usually bundle Reactive Mastro together with your own JavaScript. That means one http request less, but it also means that every time you change your JavaScript, the whole bundle changes and its cache is invalidated.)

### Pre-bundled from CDN

If you don't want to deal with the complexities of a bundler, you can use the version pre-bundled and minified by [esm.sh](https://esm.sh/). Import it as a [JavaScript module](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules), for example:

```html
<script type="module">
  import { ReactiveElement, signal } from "https://esm.sh/mastro@0.0.3/reactive?bundle-deps"
```

Instead of referencing the esm.sh CDN directly, you can of course also [**download Reactive Mastro**](https://esm.sh/stable/mastro@0.0.3/es2022/reactive.bundle.js?bundle-deps) and host it together with your other static assets.

Either way, we recommend using an [import map](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script/type/importmap) so that you can refer to the file in all your own JavaScript modules using the shorthand `mastro/reactive`. That way, there is only one place to update the version number, and changing it will not change your own JavaScript files, which would invalidate their cache.

Here's a complete example that you can save as a `.html` file and open it in your browser by double clicking:

```html
<!doctype html>
<html lang="en">
  <head>
    <title>Counter</title>
    <script type="importmap">
      {
        "imports": {
          "mastro/reactive": "https://esm.sh/stable/mastro@0.0.3/es2022/reactive.bundle.js?bundle-deps"
        }
      }
    </script>
  </head>
  <body>
    <my-counter>
      Count is <span data-bind="count">0</span>
      <button data-onclick="inc">+</button>
    </my-counter>

    <script type="module">
      import { ReactiveElement, signal } from "mastro/reactive"

      customElements.define("my-counter", class extends ReactiveElement {
        count = signal(0)
        inc () {
          this.count.set(c => c + 1)
        }
      })
    </script>
  </body>
</html>
```


## Motivation

If you want the fastest initial page load possible, you will want to send very little JavaScript to the client. For almost all kinds of websites, that means you want a MPA (Multi-Page App). If you need convincing, read Astro's [content-driven and server-first](https://docs.astro.build/en/concepts/why-astro/#content-driven) sections, or Nolan's [the balance has shifted away from SPAs](https://nolanlawson.com/2022/05/21/the-balance-has-shifted-away-from-spas/). Browsers have really stepped up their game regarding MPA page navigations. Two highlights:

- [back-forward cache](https://web.dev/articles/bfcache) is implemented in all modern browsers (meaning e.g. an infinite-loading list added with JavaScript will still be there on browser back navigation)
- [cross-document view transitions](https://developer.mozilla.org/en-US/docs/Web/API/View_Transitions_API/Using#basic_mpa_view_transition) are implemented in Chrome and the Safari Technology Preview.

### How does it compare to React, Vue, Solid, Svelte etc?

If you’re building a complex SPA (e.g. Figma or Google Sheets) which deals with client-side GUI state that contains deeply nested objects or arrays with thousands of items, then you’re probably better off with one of the major client-side frameworks (but if you're starting a new project, please go for a modern one like Solid). However, optimising for the SPA case comes at a cost. Yes, nowadays all these frameworks support server-side-rendering for a faster initial page load, but still:

- They send all the data for the current page twice: once as HTML (the server-side-rendering), and once as JSON (for hydration).
- Since they are SPAs, at the latest when the user navigates to the next page, they need to download all the code for that page to the client.
- By reimplementing things that the browser already can do (like page navigation), they send a lot of JavaScript to the client that's just not needed if you work with the browser instead of against it.

Thus if you like the developer experience of those frameworks, but have an MPA and want to avoid the performance pain-points above, then Reactive Mastro might be for you.

By completely separating the server- and client-parts, you have full control over, and complete understanding of what’s sent to the client and what’s kept on the server. Because Mastro is not using a system like JSX, you can even avoid the hassle of a build step. You just write valid HTML and plain JavaScript.

While you can use TypeScript for server and client logic, not having a template processor (like JSX) comes at the cost of TypeScript not being able to check that the attributes in the server-generated HTML actually have corresponding handlers in the client-side scripts. Perhaps we’ll introduce an optional processor in the future that changes this trade-off. Also, when in conflict, Reactive Mastro aims to prioritize initial page load speed over raw client-side rendering performance.

### How does it compare to Alpine, Stimulus and HTMX?

While these libraries are also tailored towards MPAs, and also integrate well with whatever server-side HTML templating system you’ve already in place, Reactive Mastro is even smaller:

- smaller in terms of JavaScript size: minified+gzipped, [Reactive Mastro is 2.7kB](https://bundlephobia.com/package/mastro) vs the others >10kB
- smaller in terms of API surface to learn

In Alpine, you put all logic into HTML attributes. Reactive Mastro only uses attributes to attach the signals and event listeners to the DOM. The rest is written in normal JavaScript using signals, giving you a declarative developer experience. You will be familiar with [signals](https://docs.solidjs.com/concepts/intro-to-reactivity) if you have used either Solid, Svelte runes, Vue refs or Preact signals. The use of signals is also one of the differentiators to Stimulus, where you have to remember to imperatively call the right method to update the DOM yourself in all the right places. Stimulus also requires you to add the right `data-controller` and `data-x-target` attributes, which are not needed in Reactive Mastro.

Finally, there is HTMX, where every interaction makes a request to the server which sends back some HTML that’s inserted into the DOM. You never have to think about generating HTML on the client. But it also comes at a steep cost in terms of GUI-latency, especially on a bad network connection.


## Implementation

### Signals

For signals, we currently use the [maverick-js/signals](https://github.com/maverick-js/signals) library, mostly because it's tiny (~1kB minzipped). But we could consider switching that out with [signal-polyfill](https://github.com/proposal-signals/signal-polyfill) or similar if that would suit our needs better.

Besides that, the implementation of Reactive Mastro is just three very small files: one for [`html`](html.ts) rendering, one for the [`ReactiveElement`](reactive.ts) class and one to parse the [`data-bind`](reactive.util.ts) syntax.

### Custom elements

To connect our JavaScript with the right HTML element on the page, we use [custom elements](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements). Custom elements are part of the [web components](https://developer.mozilla.org/en-US/docs/Web/API/Web_components) suite of technologies. But when using Reactive Mastro, you don't have to use shadom DOM (which has a lot of gotchas) nor `<template>` elements (which are only useful with shadom DOM).

Using custom elements means the browser handles most of the work for us, such as enabling multiple instances of the same component on the same page and instantiation of nested components as soon as they're in the DOM.

## Using Reactive Mastro

You register your custom element once with `window.customElements.define('my-counter', class extends ReactiveElement { })` (the name must start with a lowercase letter and contain a hyphen), and then you can use it wherever in your HTML body, e.g. `<my-counter></my-counter>`. No JavaScript imports nor manually calling a constructor needed.

Your class extends Reactive Mastro's `ReactiveElement` class, which in turn extends the browser's `HTMLElement` class. Thus you're almost using plain
custom elements, and have access to all native callbacks and methods (such as [attaching shadow DOM](https://github.com/mb21/mastro/issues/2)), should you choose to use them. However, what `ReactiveElement` does for you on `connectedCallback`, is two things:

- attach event listeners to handle your `data-on*` attributes (e.g. `data-onclick`), and
- bind signals to the DOM elements you put `data-bind` on.

This enables a declarative developer experience (similar to React):

- When an event (e.g. a `click` event) fires, the event listener calls an _action_ method (`inc` in the counter example above).
- That method updates a central _state_ (the signal, which is a public field of your class).
- The signal in turn causes the _view_ (i.e. the DOM) to automatically be updated in all the affected places.

This makes sure your model (the signal) stays in sync with your view (the DOM), and saves you from the spaghetti code that happens all too quickly when manually updating the DOM using jQuery or vanilla JavaScript. For a longer introduction to this approach of state management, see for example [Solid's docs](https://docs.solidjs.com/guides/state-management).

### Client-side rendering islands

One way to use Reactive Mastro is to implement an [islands architecture](https://jasonformat.com/islands-architecture/). Each custom element is an interactive island in your otherwise static (or server-rendered) HTML page. By implementing an `initialHtml` function on your component, which Reactive Mastro will call, you can client-side render the HTML for that island:

Server HTML:

```html
<my-counter start="7"></my-counter>
```

Client JS:

```js
import { html, ReactiveElement, signal } from "mastro/reactive"

customElements.define("my-counter", class extends ReactiveElement {
  count = signal(parseInt(this.getAttribute("start") || "0", 10))

  initialHtml () {
    return html`
      Counting <span data-bind="count">${this.getAttribute("start")}</span>
      <button data-onclick="inc">+</button>
    `
  }

  inc () {
    this.count.set(c => c + 1)
  }
})
```

Note the `html` function which [tags the template literal](https://blog.jim-nielsen.com/2019/jsx-like-syntax-for-tagged-template-literals/) that follows it. To syntax highlight such tagged template literals, you may want to install an extension for your favourite editor, such as [this extension for VSCode](https://marketplace.visualstudio.com/items?itemName=Tobermory.es6-string-html).

Implementing an `initialHtml` function has the advantage that you can also dynamically instantiate such a component as a child of another component, thereby building up hierarchies of client-side rendered components like you may know from SPAs. If you want to client- and server-render the same HTML, you can assign the html string to a variable, export it, and use it in your JavaScript-based server (e.g. Mastro).

### Server-side rendering even more

However, often you don't need the ability to client-side render the whole component. Instead, you would prefer to server-render almost all your HTML, and never send it to the client as JavaScript. That's where Reactive Mastro really shines: you can ship even less JavaScript to the client than in an islands architecture. See the "counter" example at the very top of this page? Note that the HTML never shows up in the client-side JavaScript. This is a pattern [some call HTML web components](https://hawkticehurst.com/2023/11/a-year-working-with-html-web-components/). In a big application with lots of content, this approach can significantly reduce your JavaScript bundle size.

It also enables you to more clearly think about what your page will look like before JavaScript finishes loading and executing, or when it fails to execute at all – an old idea called [progressive enhancement](https://developer.mozilla.org/en-US/docs/Glossary/Progressive_Enhancement).

This might mean that instead of adding and removing HTML elements in the DOM with client-side JavaScript, you server-side render all of them, and then hide some with client-side JavaScript and CSS. For example, to either show one tab or the other, in React it's common to do something like `{visibleTab === "tab1" ? <Tab1 /> : <Tab2 />}`. But that means you need to send the JavaScript to render both Tab1 and Tab2 to the client. You can avoid that e.g. as follows:

Server HTML:

```html
<simple-tabs>
  <button data-onclick="switchTo('home')">Home</button>
  <button data-onclick="switchTo('profile')">Profile</button>

  <section data-bind="class.hidden=isNotActiveTab('home')">
    <h3>Home</h3>
    <p>My home is my castle.</p>
  </section>

  <section data-bind="class.hidden=isNotActiveTab('profile')">
    <h3>Profile</h3>
    <p>My name is...</p>
  </section>
</simple-tabs>

<style>
  .hidden {
    display: none;
  }
</style>
```

Client JS:

```js
import { ReactiveElement, signal } from "mastro/reactive"

customElements.define("simple-tabs", class extends ReactiveElement {
  activeTab = signal("home")

  switchTo (tab: string) {
    this.activeTab.set(tab)
  }

  isNotActiveTab (tab: string) {
    return tab !== this.activeTab()
  }
})
```

Note how we intentially didn't add the `hidden` class in the HTML sent from the server. That way, if client-side JavaScript fails to run, the user sees both tabs and can still access the content. Depending on the layout and position of the element on the page, this might mean that on slow connections, the user first sees both elements before one is hidden once JavaScript executed (try it out by enabling [network throttling](https://developer.mozilla.org/en-US/docs/Glossary/Network_throttling) in your browser's dev tools). If you think that's a bigger problem than sometimes inaccessible content, you can of course also add the `hidden` class already on the server.


## Documentation

Reactive Mastro requires you to learn only two attributes: `data-bind` and `data-on*`.

### `data-bind`

Creates a reactive binding of a signal (or the result of a method call) to a property of the DOM element which you specify the attribute on. The following syntax variations are supported.

#### Set contents (innerHTML)
```html
<div data-bind="myField"></div>
```
This binds the `myField` signal to the contents of the div. Normal strings will be properly escaped. To construct an HTML string, use Reactive Mastro's `html` tagged template literal (e.g. ``myField = html`<strong>my text</strong>` ``).

#### Set a property
```html
<input data-bind="value=myField">
or nested properties:
<div data-bind="style.display=myField"></div>
```
This sets arbitrary [JavaScript properties, not attributes](https://stackoverflow.com/a/6004028/214446) on an element.

#### Toggle a class
```html
<div data-bind="class.myCssClass=myField"></div>
```
This toggles the specified class depending on whether `myField` is truthy or not, leaving other classes on the element untouched.

#### Pass a static attribute to a custom element
```html
<user-info name="Peter"></user-info>
```

#### Pass a signal to a custom element
```html
<user-info data-bind="props.name=myField"></user-info>
```
This uses the `props.` syntax, which is specific to Reactive Mastro. Because the `user-info` component shouldn't have to care whether the `name` passed is a static string or a signal, both will be automatically assigned as a signal to a field of the nested component, and be uniformly accessible as such (e.g. `this.name()` or `data-bind="name"`).

#### Using a helper method
```html
<div data-bind="class.hidden=isNotActiveTab('profile')"></div>
```
On the right-hand side of the equal sign, you can call a method of your class. See the tab example above. Arguments are separated by comma, and currently the following types are accepted as arguments: single-quoted strings, booleans `true` and `false`, and numbers.

#### Multiple bindings
```html
<div data-bind="myContent; style.color=myColor"></div>
```
To bind multiple things on the same element, `data-bind` accepts a semicolon-separated list of bindings.

#### Binding without introducing an extra element

If you want to avoid introducing an extra box in the layout (e.g. when using things like CSS grid or flexbox), you can use the HTML [`slot`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/slot) element: e.g. `<slot data-bind="mySignal"></slot>`. It's still an extra element, but CSS behaves like it isn't there.

### `data-on*`

There are only two variations:

```html
<button data-onclick="addTodo">+</button>
```
which calls the `addTodo` method on your class on click, and

```html
<button data-onclick="removeTodo(7)">+</button>
```
which calls the `removeTodo` method on your class, with `7` as the first argument. The same types are supported as arguments as in `data-bind` [method calls](#using-a-helper-method).

In both cases, the actual native [event](https://developer.mozilla.org/en-US/docs/Web/API/Event) is also supplied as an additional last argument.

#### Adding event listeners for less common events

To support events on HTML elements that are added to the DOM after custom element creation (e.g. as the result of a user interaction), Reactive Mastro adds one listener for the event names `click`, `change`, `input` and `submit` to the custom element and lets the event bubble up there. However, you can customize that list:

```js
customElements.define("my-counter", class extends ReactiveElement {
  constructor () {
    this.#eventNames.push("focus", "blur")
    super()
  }
})
```
