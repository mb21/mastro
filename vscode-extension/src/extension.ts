import * as vscode from 'vscode'

export const activate = async (context: vscode.ExtensionContext) => {
  context.subscriptions.push(
    vscode.commands.registerCommand('mastro.start', async () => {
      const rootFolder = vscode.workspace.workspaceFolders?.[0]?.uri
      if(!rootFolder) {
        vscode.window.showErrorMessage('Working folder not found, open a folder and try again')
        return
      }
      const basePath = rootFolder.path === "/" ? "" : rootFolder.path
      const basePathLen = basePath.length

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
      webview.html = await getWebviewContent(webview, context, basePathLen, history)
      webview.onDidReceiveMessage(async msg => {
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
          case "findFiles": {
            const { pattern, requestId } = msg
            const response = []
            for (const uri of await vscode.workspace.findFiles(pattern)) {
              response.push(uri.path.slice(basePathLen))
            }
            webview.postMessage({ type: 'success', response, requestId })
            return
          }
          case "readDir": {
            const { path, requestId } = msg
            try {
              const entries = await vscode.workspace.fs.readDirectory(rootFolder.with({ path: basePath + path }))
              const response = entries.flatMap(([name, type]) =>
                type === vscode.FileType.File ? name : []
              )
              webview.postMessage({ type: 'success', response, requestId })
            } catch (e) {
              webview.postMessage({ type: 'error', response: e, requestId })
            }
            return
          }
          case "readTextFile": {
            const { path, requestId } = msg
            try {
              const bs = await vscode.workspace.fs.readFile(rootFolder.with({ path: basePath + path }))
              const response = new TextDecoder().decode(bs)
              webview.postMessage({ type: 'success', response, requestId })
            } catch (e) {
              webview.postMessage({ type: 'error', response: e, requestId })
            }
            return
          }
          case "showError": {
            vscode.window.showErrorMessage(msg.error)
            return
          }
        }
      })

      const disposables: vscode.Disposable[] = []

      vscode.workspace.onDidSaveTextDocument(async e => {
        const html = await getWebviewContent(webview, context, basePathLen, history)
        webview.html = ''
        webview.html = html
      }, this, disposables)

      panel.onDidDispose(() => disposables.forEach(d => d.dispose()))
    })
  )
}

const getWebviewContent = async (webview: vscode.Webview, context: vscode.ExtensionContext, basePathLen: number, history: string[]) => {
  return `<!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title></title>

        <script type="importmap">
          ${await getImportMap(webview, context, basePathLen)}
        </script>

        <!--
          we need to keep the following script inline, because with asWebviewUri, it
          would be on a different origin, and then the importmap wouldn't apply anymore.
        -->
        <script type="module">
        const vscode = acquireVsCodeApi()
        try {

          const postMessageAndAwaitAnswer = msg =>
            new Promise((resolve, reject) => {
              const requestId = crypto.randomUUID()
              window.addEventListener("message", event => {
                const { data } = event
                if (data?.requestId === requestId) {
                  if (data.type === "success") {
                    resolve(data.response)
                  } else {
                    reject(data.response)
                  }
                }
              })
              vscode.postMessage({ ...msg, requestId })
            })
          window.fs = {
            findFiles: pattern => postMessageAndAwaitAnswer({ type: "findFiles", pattern }),
            readDir: pathOfDir => postMessageAndAwaitAnswer({ type: "readDir", path: pathOfDir }),
            readTextFile: path => postMessageAndAwaitAnswer({ type: "readTextFile", path }),
            staticFiles: ${await getStaticFiles(webview, basePathLen)},
          }

          // after we've populated window.fs, we can import things that use it
          const { matchRoute } = await import("mastro/router.js")

          const backBtn = document.getElementById("backBtn")
          const pathInput = document.getElementById("pathInput")
          const history = ${JSON.stringify(history)}
          const iframe = document.querySelector("iframe")

          const render = async (path) => {
            console.log('rendering ', path)
            vscode.postMessage({
              type: "pushHistory",
              path,
            })
            pathInput.value = path
            backBtn.disabled = history.length < 1
            history.push(path)

            const replaceAsync = async (str, regex, asyncFn) => {
              const promises = []
              str.replace(regex, (match, ...args) => {
                  promises.push(asyncFn(match, ...args))
                  return match
              })
              const data = await Promise.all(promises)
              return str.replace(regex, () => data.shift())
            }

            const toDataUrl = url =>
              new Promise(async resolve => {
                const reader = new FileReader()
                reader.onload = () => resolve(reader.result)
                reader.readAsDataURL(await fetch(url).then(r => r.blob()))
              })

            const replaceStaticLinksWithDataUrls = str =>
              replaceAsync(str, /(<.*?[src|href]=")([^"]+)(".*>)/gi, async (match, p1, p2, p3) => {
                  const assetPath = URL.parse(p2, "http://localhost" + path)?.pathname
                  const webViewUrl = window.fs.staticFiles[assetPath]
                  return webViewUrl
                    ? p1 + await toDataUrl(webViewUrl) + p3
                    : match
                  }
              )

            const insertNavigationInterceptScript = str => {
              // hack that injects a script that tells parent window when a link was clicked or similar
              const [head, tail] = str.split("</head>")
              return head + '<script' + '>window.addEventListener("unload", () => window.parent.postMessage({ type: "navigate", target: document.activeElement.getAttribute("href") }, "*"))</script' + '>' + "</head>" + tail
            }

            try {
              const urlStr = "http://localhost" + path
              const route = matchRoute(urlStr)
              if (route) {
                try {
                  const { GET } = await import(route.filePath)
                  const res = await GET(new Request(urlStr))
                  if (res instanceof Response) {
                    let output = await res.text()
                    output = await replaceStaticLinksWithDataUrls(output)
                    output = insertNavigationInterceptScript(output)
                    iframe.srcdoc = output
                  } else {
                    iframe.srcdoc = '<p>GET must return a Response object</p>'
                  }
                } catch (e) {
                  console.error(e)
                  iframe.srcdoc = '<p>Failed to render site: ' + e + '</p>'
                }
              } else {
                iframe.srcdoc = '<p>404 route not found</p>'
              }
            } catch (e) {
              iframe.srcdoc = '<p>' + e + '</p>'
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
        } catch (e) {
          vscode.postMessage({ type: "showError", error: e.toString() })
        }
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
            height: calc(100vh - 25px);
            width: 100%;
            overflow: hidden;
            background-color: white;
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

const getImportMap = async (webview: vscode.Webview, context: vscode.ExtensionContext, basePathLen: number) => {
  const imports = {} as Record<string, string>
  for (const uri of await vscode.workspace.findFiles('**/*.*')) {
    if (uri.path.endsWith('.js')) {
      imports[uri.path.slice(basePathLen)] = webview.asWebviewUri(uri).toString()
    }
  }
  for (const fileName of ['fs.js', 'generate.js', 'html.js', 'router.js', 'routes.js', 'server.js']) {
    const uri = vscode.Uri.joinPath(context.extensionUri, 'mastro', fileName)
    imports['mastro/' + fileName] = webview.asWebviewUri(uri).toString()
  }
  return JSON.stringify({ imports })
}

const getStaticFiles = async (webview: vscode.Webview, basePathLen: number) => {
  const files = {} as Record<string, string>
  for (const uri of await vscode.workspace.findFiles('routes/**/*.*')) {
    if (!uri.path.endsWith('.server.js')) {
      files[uri.path.slice(7 + basePathLen)] = webview.asWebviewUri(uri).toString()
    }
  }
  return JSON.stringify(files)
}
