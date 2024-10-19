import { computed, signal } from '@maverick-js/signals'
import { ReactiveElement } from '../../libs/reactive.client.ts'
import { html } from '../../libs/html.ts'

type TodoItem = { title: string; done: boolean }

const localSignal = <T>(initialVal: T, key: string) => {
  try {
    initialVal = JSON.parse(localStorage[key])
  } catch (_e) {
    // ignore
  }
  const s = signal(initialVal)
  const local = () => s()
  local.set = (newVal: T) => {
    s.set(newVal)
    localStorage[key] = JSON.stringify(newVal)
  }
  return local
}

customElements.define('todo-list', class extends ReactiveElement {
  newTitle = signal('')
  todos = localSignal<TodoItem[]>([], 'todos')

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
        <my-counter></my-counter>
        <button data-onclick="removeTodo" data-args=${i}>x</button>
      </li>
    `)
  )

  toggleTodo (e: Event, i: number) {
    const { checked } = e.target as HTMLInputElement
    const todos = [...this.todos()]
    todos[i].done = checked
    this.todos.set(todos)
  }

  updateNewTitle (e: Event) {
    const { value } = e.target as HTMLInputElement
    this.newTitle.set(value)
  }

  addTodo (e: SubmitEvent) {
    e.preventDefault()
    if (this.newTitle()) {
      this.todos.set([{ title: this.newTitle(), done: false }, ...this.todos()])
      this.newTitle.set('')
    }
  }

  removeTodo (_e: Event, i: number) {
    const todos = this.todos()
    this.todos.set([...todos.slice(0, i), ...todos.slice(i + 1)])
  }
})
