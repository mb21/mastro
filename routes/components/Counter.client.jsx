import { Signal } from "signal-polyfill"

export const CounterClient = (initialProps) => {
  const count = new Signal.State(0)

  /*
  const doubleCount = computed(() => count()*2)

  const double = computed(() =>
    doubleCount() > 3
      ? text
      : <span>{double}/span>)

  const showText = () =>
    ({ display: count() > 10 ? 'none' : '' })
  */

  const inc = () =>
    count.set(count.get() + 1)

  const path = import.meta.url.slice(Deno.mainModule.length - '/libs/generate.ts'.length + '/routes'.length)
  return { path, count, inc }
}
