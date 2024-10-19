import { computed, signal } from '@maverick-js/signals'
import { ReactiveElement } from '../libs/reactive.client.ts'
import { html } from '../libs/html.ts'

customElements.define('my-counter', class extends ReactiveElement {
  count = signal(parseInt(this.getAttribute('start') || '0', 10))
  greater3 = computed(() => this.count() >= 3)
  hideGreater3 = computed(() => this.count() >= 3 ? 'none' : '')

  initialHtml () {
    return html`
      Counting <slot data-bind="count">0</slot>
      <button data-onclick='inc'>+</button>
    `
  }

  dec () {
    this.count.set(c => c - 1)
  }

  inc () {
    this.count.set(c => c + 1)
  }
})
