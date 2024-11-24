import { ReactiveElement, signal } from 'mastro/reactive.ts'

customElements.define('simple-tabs', class extends ReactiveElement {
  activeTab = signal('home')

  switchTo (tab: string) {
    this.activeTab.set(tab)
  }

  isNotActiveTab (tab: string) {
    return tab !== this.activeTab()
  }
})
