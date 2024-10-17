import { html } from '../libs/html.ts'

export const Counter = () => html`
  <my-counter start="1">
    <style>
      .hidden {
        display: none;
      }
    </style>
    Counting <slot data-bind="count">0</slot>
    <p>hi there</p>
    <p data-bind="class.hidden=greater3">
      make it to 3!
    </p>
    <p data-bind="style.display=hideGreater3">
      go!
    </p>
    <button data-onclick='dec'>-</button>
    <button data-onclick='inc'>+</button>
  </my-counter>
  `
