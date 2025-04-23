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
      webview.html = await getWebviewContent(webview)

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

const getWebviewContent = async (webview: vscode.Webview) => {
  return `<!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title></title>

        <script type="importmap">
          {
            "imports":
              ${JSON.stringify((await vscode.workspace.findFiles('**/*.*')).reduce((acc, uri) => {
                acc[uri.path] = webview.asWebviewUri(uri).toString()
                return acc
              }, {"mastro/": "/mastro/"} as Record<string, string>))}
          }
        </script>

        <script type="module">
          try {
            const { GET } = await import("/routes/index.server.js")
            document.body.innerHTML = await GET().text()
          } catch (e) {
            document.body.innerHTML = 'Failed to render site ' + e
          }
        </script>
      </head>
      <body>
      </body>
    </html>
    `
}
