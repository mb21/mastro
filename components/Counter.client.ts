import { computed, signal } from '@maverick-js/signals'
import { ReactiveElement } from '../libs/reactive.client.ts'

window.customElements.define('my-counter', class extends ReactiveElement {
  count = signal(parseInt(this.getAttribute('start') || '0', 10))
  greater3 = computed(() => this.count() >= 3)

  dec () {
    this.count.set(c => c - 1)
  }

  inc () {
    this.count.set(c => c + 1)
  }
})
