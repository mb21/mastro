import {
  computed as signalComputed,
  root,
  effect as signalEffect,
  signal as signalSignal,
  type Dispose,
} from '/client/@maverick-js/signals/'
import { renderToString } from './html.ts'

export * from './html.ts'
export const computed = signalComputed
export const effect = signalEffect
export const signal = signalSignal

/**
 * TODO:
 * - make sure life-cycle management is correct
 * - when we set innerHTML, stop effects of elements we removed
 * - add server render example to docs (we can just import the initialHtml string from the client-component)
 */

export class ReactiveElement extends HTMLElement {
  #dispose?: Dispose
  /** override this field in your class constructor as necessary */
  #eventNames = ['click', 'change', 'input', 'submit']

  constructor () {
    super()
    this.#eventNames.forEach(eventName =>
      // to support events on elements that are added after custom element creation,
      // we add a listener to the custom element for each common event name and let the event bubble up there
      this.addEventListener(eventName, e => {
        const { dataset } = e.target || {}
        if (dataset['on' + eventName]) {
          e.stopPropagation()
          const methodName = dataset['on' + eventName].split('#').pop()
          if (typeof this[methodName] === 'function') {
            this[methodName](e, dataset.args)
          } else {
            console.warn(`${this.nodeName.toLowerCase()}#${methodName} is not a function`)
          }
        }
      })
    )
  }

  async connectedCallback () {
    if (this.#dispose) {
      // connectedCallback is also called when custom element is moved,
      // but we want to run the setup only once
      return
    }

    if (typeof this.initialHtml === 'function' && !this.innerHTML.trim()) {
      this.innerHTML = await renderToString(this.initialHtml())
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
                if (!isChildOfOtherCustomElement(rootEl, el)) {
                  const { error, prop, subprop } = parseBind(el.dataset.bind)
                  if (!error) {
                    effect(() => {
                      const val = this[field]()
                      if (prop === 'class') {
                        el.classList[val ? 'add' : 'remove'](subprop)
                      } else if (subprop) {
                        el[prop][subprop] = val
                      } else {
                        renderToString(val).then(v => {
                          el[prop] = v
                          if (prop === 'innerHTML') {
                            registerRenderingEffects(el)
                          }
                        })
                      }
                    })
                  } else {
                    console.warn(error, el)
                  }
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

      })
    })
  }

  disconnectedCallback () {
    this.#dispose?.()
  }
}

const isChildOfOtherCustomElement = (rootEl: Element, el: Element) => {
  let p = el.parentElement
  while (p && p !== rootEl) {
    if (p.nodeName.includes('-')) {
      return true
    }
    p = p.parentElement
  }
}

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
