import { type HtmlNode, h } from '../../libs/html.ts'
import { Menu } from './Menu.ts'

interface Props {
  children: HtmlNode[];
  title: string;
}

export const Layout = (props: Props) =>
  [
    Menu(),
    h('main')(...props.children),
  ]
