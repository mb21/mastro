import * as vscode from 'vscode'

/**
 * prevent tsc from transpiling dynamic import to require
 * (cannot change tsconfig because vscode extensions only support CJS modules)
 */
const dynamicImport = new Function('specifier', 'return import(specifier)');

export const activate = (context: vscode.ExtensionContext) => {
  context.subscriptions.push(
    vscode.commands.registerCommand('mastro.start', async () => {
      const rootFolder = vscode.workspace.workspaceFolders?.[0]?.uri
      if(!rootFolder) {
        vscode.window.showErrorMessage('Working folder not found, open a folder and try again')
        return
      }

      // console.log('DedicatedWorkerGlobalScope', self instanceof DedicatedWorkerGlobalScope)
      try {
        // http://localhost:3000/static/mount/server.ts and similar are available on the
        // dev server, but not on vscode.dev or github.dev
        // where it's using the GitHub REST API to get the file contents
        // see https://code.visualstudio.com/api/extension-guides/web-extensions#web-extension-main-file
        const x = await dynamicImport('../../../../../../mount/server.js')
        console.log('x', await x.handler())

        // see https://stackoverflow.com/questions/47978809/how-to-dynamically-execute-eval-javascript-code-that-contains-an-es6-module-re
        // see https://github.com/microsoft/vscode/issues/194751
        /*
        ### extension.js WebWorker

        - loads ts files with `vscode.workspace.workspaceFolders` -> ts-blank-space -> js files

        ### WebView

        - `vscode.window.createWebviewPanel()` apparently cannot load external urls directly

        ### iframe

        */
      } catch (e) {
        console.log('caught', e)
      }

      // const file = await readTextFile(vscode.Uri.joinPath(rootFolder, 'server.ts'))
      // console.log('handler', typeof handler)

      const panel = vscode.window.createWebviewPanel(
        'mastro',
        'Mastro dev server',
        vscode.ViewColumn.Two,
        {
          enableScripts: true,
        }
      )
      panel.webview.html = getWebviewContent()
    })
  )
}

const getWebviewContent = () => {
  return `<!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title></title>
    </head>
    <body>
    Hi
    </body>
    </html>
    `
}

const readTextFile = async (uri: vscode.Uri): Promise<string> =>
  new TextDecoder().decode(await vscode.workspace.fs.readFile(uri))
