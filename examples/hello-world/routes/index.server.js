import { Layout } from "../components/Layout.js"
import { html } from "mastro/html.js"
import { htmlToResponse } from "mastro/routes.js"

export const GET = () =>
  htmlToResponse(
    Layout({
      title: "Hello world",
      children: html`
        <p>Welcome!</p>
        <p><a href="about">About us</a></p>
        `
    })
  )
