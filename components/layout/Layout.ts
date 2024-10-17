import { type HtmlNode, html } from '../../libs/html.ts'
import { importMap, scripts } from "../../libs/routes.ts";
import { Menu } from './Menu.ts'

interface Props {
  children: HtmlNode | HtmlNode[];
  title: string;
}

export const Layout = (props: Props) => html`
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>${props.title}</title>
      ${importMap()}
      ${scripts('components/*.client.ts')}
    </head>
    <body>
      ${Menu()}
      <main>${props.children}</main>
    </body>
  </html>
  `
