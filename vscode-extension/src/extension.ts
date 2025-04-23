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
          try {
            const { GET } = await import("/routes/index.server.js")
            const output = await (await GET()).text()

            document.body.innerHTML = ''
            const iframe = document.createElement('iframe')
            document.body.append(iframe)
            iframe.contentDocument.body.innerHTML = output
          } catch (e) {
            console.error(e)
            document.body.innerHTML = '<p>Failed to render site: ' + e +
              '</p><pre>' + e.stack + '</pre>'
          }
        </script>
        <style>
          html, body {
            padding: 0;
            max-height: 100%;
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
