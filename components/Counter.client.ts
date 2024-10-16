import { signal, computed } from '@maverick-js/signals'
import { html } from "../libs/html.ts";

export const CounterClient = (props) => {
  const count = signal(props.start || 0)

  const doubleCount = computed(() => count()*2)

  const double = computed(() =>
    doubleCount() > 3
      ? 'greater three'
      : html`<span>${doubleCount()}</span>`)

  const showText = () =>
    count() > 10 ? 'display: none' : ''

  const inc = () =>
    count.set(count => count + 1)

  return { count, double, doubleCount, showText, inc }
}
