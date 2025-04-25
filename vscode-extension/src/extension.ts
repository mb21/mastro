import * as vscode from 'vscode'

export const activate = async (context: vscode.ExtensionContext) => {
  context.subscriptions.push(
    vscode.commands.registerCommand('mastro.start', async () => {
      const rootFolder = vscode.workspace.workspaceFolders?.[0]?.uri
      if(!rootFolder) {
        vscode.window.showErrorMessage('Working folder not found, open a folder and try again')
        return
      }

      const { webview } = vscode.window.createWebviewPanel(
        'mastro',
        'Mastro dev server',
        vscode.ViewColumn.Two,
        {
          enableScripts: true,
        }
      )
      webview.html = await getWebviewContent(webview, context)

      // vscode.workspace.onDidSaveTextDocument(e => {
      //   sendFile(webview, e.fileName, e.getText())
      // })

      // // TODO: should we use vscode.workspace.workspaceFolders instead?
      // for (const uri of await vscode.workspace.findFiles('**/*.*')) {
      //   sendFile(webview, uri.path, await readTextFile(uri))
      // }

    })
  )
}

const getWebviewContent = async (webview: vscode.Webview, context: vscode.ExtensionContext) => {
  return `<!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title></title>

        <script type="importmap">
          ${await getImportMap(webview, context)}
        </script>

        <!--
          we need to keep the following script inline, because with asWebviewUri,
          it will be on a different origin, and then the importmap doesn't apply anymore.
        -->
        <script type="module">
          const backBtn = document.getElementById("backBtn")
          const pathInput = document.getElementById("pathInput")
          const history = []
          const iframe = document.createElement("iframe")
          document.body.append(iframe)

          // TODO: import proper implementation from mastro
          const matchRoute = path => {
            const p = path === "/" ? "/index" : path
            return { filePath: "/routes" + p + ".server.js" }
          }

          const render = async (path) => {
            console.log('rendering ', path)
            pathInput.value = path
            backBtn.disabled = history.length < 1
            history.push(path)
            try {
              const route = matchRoute(path)
              const { GET } = await import(route.filePath)
              const output = await (await GET()).text()

              iframe.contentDocument.body.innerHTML = output
            } catch (e) {
              console.error(e)
              iframe.contentDocument.body.innerHTML = '<p>Failed to render site: ' + e + '</p>'
            }
          }

          iframe.contentWindow.addEventListener("beforeunload", event => {
            const path = URL.parse(
              iframe.contentDocument.activeElement.getAttribute("href"),
              "http://localhost" + pathInput.value,
            )?.pathname
            console.log('beforeunload', path)
            if (path) {
              event.preventDefault() // seems to have no effect, see https://stackoverflow.com/questions/64460516/
              setTimeout(() => render(path), 100)
            }
          })

          render("/")

          document.querySelector("form").addEventListener("submit", e => {
            e.preventDefault()
            render(pathInput.value || "/")
          })
          backBtn.addEventListener("click", e => {
            history.pop()
            render(history.pop())
          })
        </script>

        <style>
          html {
            height: 100%;
          }
          body {
            padding: 0;
            min-height: 100%;
          }
          form {
            margin: 0 1em;
          }
          input {
            background-color: transparent;
            color: var(--vscode-editor-foreground);
            font-family: var(--vscode-font-family);
            font-weight: var(--vscode-font-weight);
            font-size: var(--vscode-font-size);
          }
          iframe {
            border: 0;
            height: 100%;
            width: 100%;
            overflow: hidden;
          }
        </style>
      </head>
      <body>
        <form>
          <button id="backBtn" type="button" disabled>←</button>
          <input id="pathInput">
        </form>
      </body>
    </html>
    `
}

const getImportMap = async (webview: vscode.Webview, context: vscode.ExtensionContext) => {
  const imports = {} as Record<string, string>
  for (const uri of await vscode.workspace.findFiles('**/*.*')) {
    if (uri.path.endsWith('.js')) {
      imports[uri.path] = webview.asWebviewUri(uri).toString()
    } else {
      // TODO: CSS etc.
    }
  }
  for (const fileName of ['fs.js', 'generate.js', 'html.js', 'router.js', 'routes.js', 'server.js']) {
    const uri = vscode.Uri.joinPath(context.extensionUri, 'mastro', fileName)
    imports['mastro/' + fileName] = webview.asWebviewUri(uri).toString()
  }
  return JSON.stringify({ imports })
}
