import {
  computed as signalComputed,
  root,
  effect as signalEffect,
  signal as signalSignal,
  type Dispose,
} from '/client/@maverick-js/signals/'
import { renderToString } from './html.ts'
import { parseArgs, parseBind } from "./reactive.util.ts";

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
        const { target } = e
        const value = target && target instanceof HTMLElement
          ? target.dataset['on' + eventName]
          : undefined
        if (value) {
          e.stopPropagation()
          const [methodName, rawArgs] = value.split('(')
          const args = parseArgs(rawArgs)
          // @ts-ignore noImplicitAny
          if (typeof this[methodName] === 'function') {
            // @ts-ignore noImplicitAny
            this[methodName](...args, e)
          } else {
            console.warn(`${this.nodeName.toLowerCase()}#${methodName.toString()} is not a function`)
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

    // @ts-ignore key initialHtml does not exist
    if (typeof this.initialHtml === 'function' && !this.innerHTML.trim()) {
      this.innerHTML = await renderToString(
        // @ts-ignore key initialHtml does not exist
        this.initialHtml()
      )
    }

    for (const attr of this.attributes) {
      if (!attr.name.startsWith('data-')) {
        // in order to have a uniform interface for component props,
        // we create signals from static attributes and assign them to fields
        // @ts-ignore noImplicitAny
        this[attr.name] = () => attr.value
      }
    }

    setTimeout(() => {
      root(dispose => {
        this.#dispose = dispose

        const registerRenderingEffects = (rootEl: Element) => {
          for (const el of rootEl.querySelectorAll(`[data-bind]`)) {
            if (el instanceof HTMLElement && !isChildOfOtherCustomElement(rootEl, el)) {
              for (const bind of el.dataset.bind?.split(';') || []) {
                const { error, prop, subprop, fieldOrMethod, args } = parseBind(bind)
                if (error) {
                  console.warn(error, el)
                // @ts-ignore noImplicitAny
                } else if (typeof this[fieldOrMethod] !== 'function') {
                  console.warn(`${this.nodeName.toLowerCase()}#${fieldOrMethod
                    } is not a signal or method`, el)
                } else {
                  effect(() => {
                    // @ts-ignore noImplicitAny
                    const val = this[fieldOrMethod](...args)
                    if (prop === 'class' && subprop) {
                      // e.g. data-bind="class.myClass = myField"
                      el.classList[val ? 'add' : 'remove'](subprop)
                    } else if (prop === 'props' && subprop) {
                      // e.g. data-bind="props.myChildField = myParentField"
                      // @ts-ignore noImplicitAny
                      el[subprop] = this[fieldOrMethod]
                    } else if (subprop) {
                      // e.g. data-bind="dataset.myKey = myField"
                      // @ts-ignore noImplicitAny
                      el[prop][subprop] = val
                    } else if (prop === 'innerHTML') {
                      // e.g. data-bind="myField"
                      renderToString(val).then(v => {
                        el[prop] = v
                        registerRenderingEffects(el)
                      })
                    } else {
                      // e.g. data-bind="required = myField"
                      // @ts-ignore noImplicitAny
                      el[prop] = val
                    }
                  })
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
