import { html } from '../libs/html.ts'

export const Counter = () => html`
  <my-counter start="1">
    Counting <slot name="count">0</slot>
    <p>hi there</p>
    <slot data-class="hidden" name="greater3">
      <p>make it to 3!</p>
    </slot>
    <button data-onclick='inc'>+</button>
  </my-counter>
  `
