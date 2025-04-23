import { Layout } from "../components/Layout.js"
import { html } from "mastro/html.js"
import { htmlToResponse } from "mastro/routes.js"

export const GET = () =>
  htmlToResponse(
    Layout({
      title: "About us",
      children: html`<p>About us</p>`
    })
  )
