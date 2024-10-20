import { computed, signal } from '@maverick-js/signals'
import { ReactiveElement } from '../libs/reactive.client.ts'
import { html } from '../libs/html.ts'

customElements.define('user-info', class extends ReactiveElement {
  initialHtml () {
    return html`
      <div>Company: ${this.getAttribute('company')}</div>
      <div>Company: <slot data-bind="company"></slot></div>
      <div>Name: <slot data-bind="name"></slot></div>
      <div>Tab name: <slot data-bind="tabName"></slot></div>
      `
  }
})

customElements.define('tab-switch', class extends ReactiveElement {
  userName = signal<string | undefined>(undefined)
  tabName = signal('profile')

  renderTab = computed(() => {
    switch(this.tabName()) {
      case 'home': return html`
        <h3>Home</h3>
        <p>My home is my castle.</p>
        `
      case 'profile': return html`
        <h3>Profile</h3>
        <label>
          User name
          <input data-onchange="setUserName">
          <user-info company="Octan" data-props="name=userName, tabName=tabName"></user-info>
        </label>
        `
      case 'settings': return html`
        <h3>Profile</h3>
        <p>Nothing to tune?!</p>
        `
    }
  })

  initialHtml () {
    return html`
      <div>Logged in as <slot data-bind="userName"></slot></div>
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

  setUserName (e: Event) {
    const { value } = e.target as HTMLInputElement
    this.userName.set(value)
  }

  switchTo (_e: Event, tabName: string) {
    this.tabName.set(tabName)
  }
})
