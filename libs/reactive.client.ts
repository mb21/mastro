import { root, effect } from "@maverick-js/signals"

const eventNames = ['click', 'input', 'submit']

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

export class ReactiveElement extends HTMLElement {
  #dispose

  connectedCallback () {
    root(dispose => {
      this.#dispose = dispose
      Object.getOwnPropertyNames(this).forEach(field => {
        if (typeof this[field] !== 'function') {
          return console.warn(`${this.nodeName.toLowerCase()}#${field} is a public field but not a signal`)
        }
        this.querySelectorAll(`[data-bind$=${field}]`).forEach(el => {
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
              }
            })
          }
        })
      })

      eventNames.forEach(eventName =>
        this.querySelectorAll(`[data-on${eventName}]`).forEach(el => {
          const methodName = el.dataset['on' + eventName].split('#').pop()
          el.addEventListener(eventName, e => this[methodName](e))
        })
      )
    })
  }

  disconnectedCallback () {
    this.#dispose?.()
  }
}
