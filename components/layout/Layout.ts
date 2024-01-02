import * as h from '../../libs/html.ts'
import { Menu } from './Menu.ts'

interface Props {
  children: h.Node[];
  title: string;
}

export const Layout = (props: Props) =>
  [
    h.html(h.attr({ lang: 'en' }),
      h.head(
        h.meta(h.attr({ charset: 'UTF-8' })),
        h.title(props.title),
      ),
      h.body(
        Menu(),
        h.main(...props.children),
      ),
    )
  ]
