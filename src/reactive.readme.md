# Reactive Mastro

Server part is plain valid HTML:

```html
<my-counter>
  Count is <slot data-bind="count">0</slot>
  <button data-onclick='inc'>+</button>
</my-counter>
```


Client part is plain JavaScript:

```js
import { ReactiveElement, signal } from 'mastro/reactive'

customElements.define('my-counter', class extends ReactiveElement {
  count = signal(0)

  inc () {
    this.count.set(c => c + 1)
  }
})
```

For more examples and how they are used, see [/components/**/*.client.ts](../examples/blog/components/) and [/routes/index.ts](../examples/blog/routes/index.ts) respectively.


## Motivation

The design goal for Reactive Mastro is to be a reactive GUI library that sits somewhere in between Alpine/HTMX/Stimulus on one end, and React/Vue/Solid/Svelte/etc on the other end – while being smaller and simpler than all of them.

When in conflict, we prioritise a fast page load over client-side rendering performance. And if you share that goal, you not only want server-side rendered HTML, you also want an [MPA architecture](https://nolanlawson.com/2022/05/21/the-balance-has-shifted-away-from-spas/).

### How does it compare to React, Vue, Solid, Svelte etc?

If you’re building a complex SPA (e.g. Figma or Google Sheets) which deals with client-side GUI state that contains deeply nested objects or arrays with thousands of items, then you’re probably better off with one of the major client-side frameworks like Solid. However, optimising for the SPA case comes at a cost. Yes, nowadays all these frameworks support server-side-rendering for a faster initial page load, but still:

- They send all the data for the current page twice: once as HTML (the server-side-rendering), and once as JSON (for hydration).
- Since they are SPAs, at the latest when the user navigates to the next page, they need to download all the code for that page to the client.

Thus if you like the developer experience of those frameworks, but have an MPA and want to avoid the two performance pain-points above, then Reactive Mastro might be for you.

By completely separating the server- and client-parts, and you have full control over, and complete understanding of what’s sent to the client and what’s kept on the server. You may even avoid the hassle of a bundler. You just write valid HTML and plain JavaScript. While you can use TypeScript for server and client logic, not having a template processor (like JSX) comes at the cost of TypeScript not being able to check that the attributes in the server-generated HTML actually have corresponding handlers in the client-side scripts. Perhaps we’ll introduce an optional processor in the future that changes this trade-off.

### How does it compare to Alpine, Stimulus and HTMX?

While these libraries are also tailored towards MPAs, and also integrate well with whatever server-side HTML templating system you’ve already in place, Reactive Mastro is even smaller:

- Smaller in terms of JavaScript size: Reactive Mastro is ~5kb vs the others >10kb minified+gzipped, and
- in terms of API surface to learn.

In Alpine, you put all logic into the HTML attributes. Reactive Mastro only uses attributes to attach the signals and event listeners to the DOM. The rest is written in normal JavaScript modules using signals, giving you a declarative DevEx. You will be familiar with signals if you have used e.g. Solid, Svelte runes, Vue refs or Preact signals. The use of signals is precisely what differentiates us from Stimulus, where you have to remember to imperatively call the right method to update the DOM yourself in all the right places.

Finally, in HTMX, every interaction makes a request to the server that sends back some HTML that’s inserted into the DOM. You never have to think about generating HTML on the client. But it also comes at a steep cost in terms of GUI-latency, especially on a bad network connection.


## Implementation

For signals, we currently use the [maverick-js/signals](https://github.com/maverick-js/signals) library, mostly because it's tiny (~1kB minzipped). But we could consider switching that out with [signal-polyfill](https://github.com/proposal-signals/signal-polyfill) or similar if that would suit our needs better.

Besides that, the implementation is just two very small files: [html](./html.ts) and [reactive](./reactive.ts).
