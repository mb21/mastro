import { computed, signal } from '@maverick-js/signals'
import { ReactiveElement } from '../../libs/reactive.client.ts'
import { html } from '../../libs/html.ts'

window.customElements.define('todo-list', class extends ReactiveElement {
  newTitle = signal('')
  todos = signal<string[]>([])

  renderedTodos = computed(() =>
    this.todos().map(t => html`<li>${t}</li>`)
  )

  updateNewTitle (e: Event) {
    const { value } = e.target as HTMLInputElement
    this.newTitle.set(value)
  }

  addTodo (e: SubmitEvent) {
    e.preventDefault()
    if (this.newTitle()) {
      this.todos.set(todos => [this.newTitle(), ...todos])
      this.newTitle.set('')
    }
  }

})
