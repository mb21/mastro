import { type Html, html } from "mastro/html.ts"

interface Props {
  children: Html;
  title: string;
}

export const Layout = (props: Props) =>
  html`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name='viewport' content='width=device-width'>
        <title>Reactive Mastro ${props.title}</title>
        <script type="importmap">
          {
            "imports": {
              "mastro/reactive": "https://esm.sh/stable/mastro@0.0.3/es2022/reactive.bundle.js?bundle-deps"
            }
          }
        </script>
        <link rel="icon" href=${favicon}>
        <style>
          html, body {
            font-family: Georgia, serif;
            line-height: 1.3;
            font-size: 18px;
            padding: 1em 5vw;
          }
          main {
            max-width: 40em;
          }
        </style>
      </head>
      <body>
        <main>${props.children}</main>
      </body>
    </html>
    `

const favicon = 'data:image/svg+xml,' + encodeURI([
  "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'>",
  "<text y='.9em' font-size='90'>👨‍🍳</text>",
  "</svg>"
].join(""))
