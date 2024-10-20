import { computed, signal } from '@maverick-js/signals'
import { ReactiveElement } from '../libs/reactive.client.ts'
import { html } from '../libs/html.ts'

customElements.define('tab-switch', class extends ReactiveElement {
  tabName = signal('home')

  renderTab = computed(() => {
    switch(this.tabName()) {
      case 'home': return html`
        <h3>Home</h3>
        <p>My home is my castle.</p>
        `
      case 'profile': return html`
        <h3>Profile</h3>
        <p>Where are the settings?!</p>
        `
      case 'settings': return html`
        <h3>Profile</h3>
        <p>Nothing to tune?!</p>
        `
    }
  })

  initialHtml () {
    return html`
      <ul>
        <li>
          <button data-onclick="switchTo" data-args="home">Home</button>
        </li>
        <li>
          <button data-onclick="switchTo" data-args="profile">Profile</button>
        </li>
        <li>
          <button data-onclick="switchTo" data-args="settings">Settings</button>
        </li>
      </ul>
      <div data-bind="renderTab"></div>
    `
  }

  switchTo (_e: Event, tabName: string) {
    this.tabName.set(tabName)
  }
})
