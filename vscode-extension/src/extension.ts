import * as vscode from 'vscode'

export const activate = async (context: vscode.ExtensionContext) => {
  context.subscriptions.push(
    vscode.commands.registerCommand('mastro.start', async () => {
      const rootFolder = vscode.workspace.workspaceFolders?.[0]?.uri
      if(!rootFolder) {
        vscode.window.showErrorMessage('Working folder not found, open a folder and try again')
        return
      }

      const panel = vscode.window.createWebviewPanel(
        'mastro',
        'Mastro dev server',
        vscode.ViewColumn.Two,
        {
          enableScripts: true,
        }
      )
      const { webview } = panel

      const history: string[] = []
      webview.html = await getWebviewContent(webview, context, history)
      webview.onDidReceiveMessage(msg => {
        switch (msg.type) {
          case "pushHistory": {
            history.push(msg.path)
            return
          }
          case "popHistoryTwice": {
            history.pop()
            history.pop()
            return
          }
        }
      })

      const disposables: vscode.Disposable[] = []

      vscode.workspace.onDidSaveTextDocument(async e => {
        const html = await getWebviewContent(webview, context, history)
        webview.html = ''
        webview.html = html
      }, this, disposables)

      panel.onDidDispose(() => disposables.forEach(d => d.dispose()))
    })
  )
}

const getWebviewContent = async (webview: vscode.Webview, context: vscode.ExtensionContext, history: string[]) => {
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
          const vscode = acquireVsCodeApi()
          const backBtn = document.getElementById("backBtn")
          const pathInput = document.getElementById("pathInput")
          const history = ${JSON.stringify(history)}
          const iframe = document.querySelector("iframe")

          // TODO: import proper implementation from mastro
          const matchRoute = path => {
            const p = path === "/" ? "/index" : path
            return { filePath: "/routes" + p + ".server.js" }
          }

          const render = async (path) => {
            console.log('rendering ', path)
            vscode.postMessage({
              type: "pushHistory",
              path,
            })
            pathInput.value = path
            backBtn.disabled = history.length < 1
            history.push(path)
            try {
              const route = matchRoute(path)
              const { GET } = await import(route.filePath)
              const output = await (await GET()).text()

              // following hack tells parent window when a link was clicked or similar
              const [x, y] = output.split("</head>")
              const output2 = x +
                '<script' + '>window.addEventListener("unload", () => window.parent.postMessage({ type: "navigate", target: document.activeElement.getAttribute("href") }, "*"))</script' + '>' +
                "</head>" + y

              iframe.srcdoc = output2
            } catch (e) {
              console.error(e)
              iframe.contentDocument.body.innerHTML = '<p>Failed to render site: ' + e + '</p>'
            }
          }

          window.addEventListener("message", event => {
            const { data } = event
            if (data.type === "navigate" && data.target) {
              const path = URL.parse(data.target, "http://localhost" + pathInput.value)?.pathname
              if (path) {
                render(path)
              }
            }
          })

          render("${history.at(-1) || '/'}")

          document.querySelector("form").addEventListener("submit", e => {
            e.preventDefault()
            render(pathInput.value || "/")
          })
          backBtn.addEventListener("click", e => {
            history.pop()
            render(history.pop())
            vscode.postMessage({
              type: "popHistoryTwice",
            })
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
        <iframe sandbox="allow-modals allow-scripts">
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
