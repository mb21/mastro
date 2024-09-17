import { type HtmlNode, html } from '../../libs/html.ts'
import { Menu } from './Menu.ts'

interface Props {
  children: HtmlNode | HtmlNode[];
  title: string;
}

export const Layout = (props: Props) => html`
  ${Menu()}
  <main>${props.children}</main>
  `
