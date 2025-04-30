import { Layout } from "../components/Layout.js"
import { html } from "mastro/html.js"
import { readDir, readTextFile } from "mastro/fs.js"
import { htmlToResponse } from "mastro/routes.js"

export const GET = () =>
  htmlToResponse(
    Layout({
      title: "Hello world",
      children: html`
        <p>Welcome!</p>
        <p><a href="about">About us</a></p>
        <ul>
          ${readDir("/routes").then(dir => dir.map(file => html`<li>${file}</li>`))}
        </ul>
        <pre>
          ${readTextFile("/routes/about.server.js")}
        </pre>
        `
    })
  )
