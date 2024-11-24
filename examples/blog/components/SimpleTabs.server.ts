import { html } from 'mastro/html.ts'

export const SimpleTabs = () => html`
  <simple-tabs>
    <button data-onclick="switchTo('home')">Home</button>
    <button data-onclick="switchTo('profile')">Profile</button>

    <section data-bind="class.hidden=isNotActiveTab('home')">
      <h3>Home</h3>
      <p>My home is my castle.</p>
    </section>

    <section data-bind="class.hidden=isNotActiveTab('profile')">
      <h3>Profile</h3>
      <p>My name is...</p>
    </section>
  </simple-tabs>
  `
