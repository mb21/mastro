import { html } from 'mastro/html.ts'

export const TodoList = () => html`
  <todo-list>
    <form data-onsubmit="addTodo">
      <input data-bind="value=newTitle" data-oninput="updateNewTitle">
      <button>+</button>
    </form>
    <ul data-bind="renderedTodos">
    </ul>
  </todo-list>
  `