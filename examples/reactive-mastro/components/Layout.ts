import { type Html, html } from "mastro/html.ts"

interface Props {
  children: Html;
  title: string;
}

export const Layout = (props: Props) => {
  const isExample = props.title.endsWith(' example')

  return html`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name='viewport' content='width=device-width'>
        <title>Reactive Mastro ${props.title}</title>
        ${isExample
          ? html`
            <script type="importmap">
              {
                "imports": {
                  "mastro/reactive": "https://esm.sh/stable/mastro@0.0.3/es2022/reactive.bundle.js?bundle-deps"
                }
              }
            </script>
            <script
              type="module"
              src=${props.title.slice(0, 0 - ' example'.length).toLowerCase() + '.client.ts'}>
            </script>
            `
          : ''}
        <link rel="icon" href=${favicon}>
        <style>
          html, body {
            font-family: monospace;
            padding: 1em 5vw;
          }
          main {
            max-width: 40em;
          }
          h1 {
            margin-bottom: 2em;
          }
          ol, ul {
            padding-left: 0;
          }
          li {
            list-style-type: none;
          }
          .hidden {
            display: none;
          }
        </style>
      </head>
      <body>
        ${isExample
          ? html`
            <p>← <a href="..">Reactive Mastro examples</a></p>
            <h1>${props.title}</h1>
            `
          : ''}
        <main>${props.children}</main>
      </body>
    </html>
    `
}

const favicon = 'data:image/svg+xml,' + encodeURI([
  "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'>",
  "<text y='.9em' font-size='90'>👨‍🍳</text>",
  "</svg>"
].join(""))
