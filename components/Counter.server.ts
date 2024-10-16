import { html } from '../libs/html.ts'
import { CounterClient } from './Counter.client.ts'

export const Counter = () => {
  // Not sure if we need this, but init
  // would create a client object with the same keys defined as what CounterClient returns,
  // but the values are all replaced with what we need on the server.
  const client = init(CounterClient(1))

  return html`
    <div id=${client.rootId}>
      <div>${client.count()}</div>
      <div>${client.double()}</div>
      <p style=${client.showText()}>
        Congrats, you counted above 10!
        (Note that this string isn't in the client-side JS.)
      </p>
      <button onClick=${client.inc}>
        +
      </button>
    </div>
  `
}

const init = <T extends Record<string, Function>>(obj: T) => {
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
  // TODO: to find comments: document.createTreeWalker(el, NodeFilter.SHOW_COMMENT)
  const js = `
    <script type="module">
      import { CounterClient } from './Counter.client'
      import { root, effect } from '@maverick-js/signals'


      const client = CounterClient()
      const rootEl = document.getElementById('${rootId}')
      for (el in rootEl.querySelectorAll('[data-marker^="${rootId}-"]')) {
        const attr = el.dataset.marker.split('-').pop()
        effect(() => {
          el.innerHTML = client[attr]()
        })
      }
    </script>
  `
  return { ...obj, rootId }
}
