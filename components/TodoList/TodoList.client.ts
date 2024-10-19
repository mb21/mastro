import { computed, signal } from '@maverick-js/signals'
import { ReactiveElement } from '../../libs/reactive.client.ts'
import { html } from '../../libs/html.ts'

type TodoItem = { title: string; done: boolean }

customElements.define('todo-list', class extends ReactiveElement {
  newTitle = signal('')
  todos = signal<TodoItem[]>([])

  renderedTodos = computed(() =>
    this.todos().map((todo, i) => html`
      <li>
        <input
          type="checkbox"
          ${todo.done ? 'checked' : ''}
          data-onchange='toggleTodo'
          data-args=${i}
          >
        ${todo.title}
      </li>
    `)
  )

  toggleTodo (e: Event, i: number) {
    const { checked } = e.target as HTMLInputElement
    this.todos.set(todos => {
      todos[i].done = checked
      return [...todos]
    })
  }

  updateNewTitle (e: Event) {
    const { value } = e.target as HTMLInputElement
    this.newTitle.set(value)
  }

  addTodo (e: SubmitEvent) {
    e.preventDefault()
    if (this.newTitle()) {
      this.todos.set(todos => [{ title: this.newTitle(), done: false }, ...todos])
      this.newTitle.set('')
    }
  }

})
