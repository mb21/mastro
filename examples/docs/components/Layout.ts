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
        <link href="https://esm.sh/prismjs@1.30.0/themes/prism.css" rel="stylesheet" />
        <link href="https://esm.sh/prismjs@1.30.0/plugins/diff-highlight/prism-diff-highlight.css" rel="stylesheet" />
        <style>
          html, body {
            font-family: Georgia, serif;
            line-height: 1.3;
            font-size: 20px;
            padding: 1em 5vw;
          }
          main {
            max-width: 40em;
          }
          .remark-highlight {
            font-size: 0.9em;
          }
          .diff-highlight {
            display: grid;
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
