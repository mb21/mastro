import { root, effect } from "@maverick-js/signals"

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
        // to support events on elements that are added after custom element creation,
        // we add a listener to the custom element for each common event name and let the event bubble up there
        this.addEventListener(eventName, e => {
          const { dataset } = e.target || {}
          if (dataset['on' + eventName]) {
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
