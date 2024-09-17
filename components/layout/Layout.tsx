import { JSX } from "preact/jsx-runtime"

interface Props {
  children: JSX.Element | JSX.Element[];
  title: string;
}

export const Layout = (props: Props) =>
  <>
    // Menu
    <main>
      {props.children}
    </main>
  </>


console.log(Layout.toString())
