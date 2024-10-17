import { root, effect } from "@maverick-js/signals"

export class ReactiveElement extends HTMLElement {
  #dispose

  connectedCallback () {
    root(dispose => {
      this.#dispose = dispose
      Object.getOwnPropertyNames(this).forEach(field => {
        if (typeof this[field] !== 'function') {
          return console.warn(`${this.nodeName.toLowerCase()}#${field} is a public field but not a signal`)
        }
        this.querySelectorAll(`[name=${field}]`).forEach(el => {
          effect(() => {
            const val = this[field]()
            const className = el.dataset['class']
            const { style, attribute } = el.dataset
            if (className) {
              el.classList[val ? 'add' : 'remove'](className)
            } else if (style) {
              el.style[style] = val
            } else if (attribute) {
              el.setAttribute(val)
            } else {
              el.innerHTML = val
            }
          })
        })
      })

      this.querySelectorAll('[data-onclick]').forEach(el => {
        const methodName = el.dataset.onclick.split('#').pop()
        el.addEventListener('click', () => this[methodName]())
      })
    })
  }

  disconnectedCallback () {
    this.#dispose?.()
  }
}
