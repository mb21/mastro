import { root, effect, type Dispose } from '@maverick-js/signals'
import { html } from '../libs/html.ts'
import { CounterClient } from './Counter.client.ts'

export const Counter = () => {
  // Not sure if we need this, but init
  // would create a client object with the same keys defined as what CounterClient returns,
  // but the values are all replaced with what we need on the server.
  // const client = init(CounterClient(1))

  return init(CounterClient, { start: 1 }, client => html`
    <div>${client.count()}</div>
    <div>${client.double()}</div>
    <p style=${client.showText()}>
      Congrats, you counted above 10!
      (Note that this string isn't in the client-side JS.)
    </p>
    <button onClick=${client.inc}>
      +
    </button>
  `)
}

// TODO: implement this changed api
const init = <T extends Record<string, Function>>(obj: T, props, render: Function) => {
  const rootId = crypto.randomUUID()
  for (const key in obj) {
    const val = obj[key]
    if (typeof val === 'function') {
      // replace with function that returns placeholder with marker,
      // which is to be serialized in the `html` tagged template function
      const marker = rootId + '-' + key
      obj[key] = () => ({ type: 'marker', marker, node: val() })
    }
  }
  return { ...obj, rootId }
}

const initCustomElement = (name: `${string}-${string}`, Component: (props?: Record<string, string>) => Record<string, Function>) => {
  if (!window.customElements.get(name)) {
    window.customElements.define(name, class extends HTMLElement {
      dispose: Dispose | undefined = undefined

      connectedCallback () {
        root(dispose => {
          this.dispose = dispose

          const initialProps = {}
          for (const attr of this.attributes) {
            initialProps[attr.localName] = attr.value
          }
          const client = Component(initialProps)

          // TODO: to find comments: document.createTreeWalker(el, NodeFilter.SHOW_COMMENT)
          for (const el in this.querySelectorAll('[data-marker^="${rootId}-"]')) {
            const attr = el.dataset.marker.split('-').pop()
            effect(() => {
              el.innerHTML = client[attr]()
            })
          }
        })
      }
      disconnectedCallback () {
        this.dispose?.()
      }
    })
  }
}
