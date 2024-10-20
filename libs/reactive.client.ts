import { root, effect } from "@maverick-js/signals"
import { renderNode } from "./html.ts";


export class ReactiveElement extends HTMLElement {
  #dispose

  connectedCallback () {
    if (typeof this.initialHtml === 'function' && !this.innerHTML.trim()) {
      this.innerHTML = renderNode(this.initialHtml())
    }

    root(dispose => {
      this.#dispose = dispose

      const registerRenderingEffects = (rootEl: Element) => {
        Object.getOwnPropertyNames(this).forEach(field => {
          if (typeof this[field] === 'function') {
            rootEl.querySelectorAll(`[data-bind$=${field}]`).forEach(el => {
              const { error, prop, subprop } = parseBind(el.dataset.bind)
              if (error) {
                console.warn(error, el)
              } else {
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
              }
            })
          } else {
            return console.warn(`${this.nodeName.toLowerCase()}#${field} is a public field but not a signal`)
          }
        })
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
  }

  disconnectedCallback () {
    this.#dispose?.()
  }
}

const eventNames = ['click', 'change', 'input', 'submit']

/**
 * Parses string 'prop.subprop=value' => { prop, subprop, error }
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
