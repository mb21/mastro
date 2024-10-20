import { root, effect } from "@maverick-js/signals"
import { renderNode } from "./html.ts";

/**
 * TODO:
 * - fix life-cycle management:
 *   - see https://x.com/jlarky/status/1848102780428304479
 *   - unsubscribe event listeners
 *   - when we set innerHTML, stop effects of elements we removed
 * - think how multiple nested custom element behave (especially same element nested in itself)
 *   (can we limit scope somehow to current component without using shadom-dom?)
 * - add serve render example to docs (we can just import the initialHtml string from the client-component)
 */

export class ReactiveElement extends HTMLElement {
  #dispose

  connectedCallback () {
    if (typeof this.initialHtml === 'function' && !this.innerHTML.trim()) {
      this.innerHTML = renderNode(this.initialHtml())
    }

    for (const attr of this.attributes) {
      if (!attr.name.startsWith('data-')) {
        this[attr.name] = () => attr.value
      }
    }

    setTimeout(() => {
      root(dispose => {
        this.#dispose = dispose

        const registerRenderingEffects = (rootEl: Element) => {
          for (const field of Object.getOwnPropertyNames(this)) {
            if (typeof this[field] === 'function') {
              for (const el of rootEl.querySelectorAll(`[data-bind$=${field}]`)) {
                const { error, prop, subprop } = parseBind(el.dataset.bind)
                if (!error) {
                  effect(() => {
                    const val = this[field]()
                    if (prop === 'class') {
                      el.classList[val ? 'add' : 'remove'](subprop)
                    } else if (subprop) {
                      el[prop][subprop] = val
                    } else {
                      el[prop] = Array.isArray(val) ? val.join(' ') : val
                      if (prop === 'innerHTML') {
                        registerRenderingEffects(el)
                      }
                    }
                  })
                } else {
                  console.warn(error, el)
                }
              }
            } else {
              return console.warn(`${this.nodeName.toLowerCase()}#${field} is a public field but not a signal`)
            }

            for (const el of rootEl.querySelectorAll(`[data-props]`)) {
              for (const p of el.dataset.props.split(',')) {
                const [prop, field] = p.split('=').map(s => s.trim())
                if (prop && field && typeof this[field] === 'function') {
                  el[prop] = this[field]
                } else {
                  console.warn('Could not parse data-props of', el, `or ${this.nodeName.toLowerCase()}#${field} is not a signal`)
                }
              }
            }
          }
        }
        registerRenderingEffects(this)

        eventNames.forEach(eventName =>
          // to support events on elements that are added after custom element creation,
          // we add a listener to the custom element for each common event name and let the event bubble up there
          this.addEventListener(eventName, e => {
            const { dataset } = e.target || {}
            if (dataset['on' + eventName]) {
              e.stopPropagation()
              const methodName = dataset['on' + eventName].split('#').pop()
              if (typeof this[methodName] === 'function') {
                const args = dataset.args?.split(',') || []
                this[methodName](e, ...args)
              } else {
                console.warn(`${this.nodeName.toLowerCase()}#${methodName} is not a function`)
              }
            }
          })
        )
      })
    })
  }

  disconnectedCallback () {
    this.#dispose?.()
  }
}

const eventNames = ['click', 'change', 'input', 'submit']

/**
 * ```
 * parseBind('prop.subprop=value') === { prop, subprop }
 * parseBind('value') === { prop: 'innerHTML' }
 * ```
 */
const parseBind = (bind: string) => {
  const parts = bind.split('=')
  if (parts.length === 2) {
    const [prop, subprop] = parts[0].trim().split('.')
    return prop
      ? { prop, subprop }
      : { error: 'Found invalid data-bind value' }
  } else {
    return { prop: 'innerHTML' }
  }
}
