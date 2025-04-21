import * as vscode from 'vscode'
import tsBlankSpace from 'ts-blank-space'

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
      webview.html = getWebviewContent()

      vscode.workspace.onDidSaveTextDocument(e => {
        sendFile(webview, e.fileName, e.getText())
      })

      // TODO: should we use vscode.workspace.workspaceFolders instead?
      for (const uri of await vscode.workspace.findFiles('**/*.*')) {
        sendFile(webview, uri.path, await readTextFile(uri))
      }

    })
  )
}
const sendFile = (webview: vscode.Webview, fileName: string, text: string) => {
  const msg = fileName.endsWith('.ts')
   ? {
       fileName: fileName.slice(0, -2) + 'js',
       text: replaceTsImportsWithJs(tsBlankSpace(text)),
     }
   : { fileName, text }
  webview.postMessage(msg)
}

/*
- extension.js WebWorker
  - loads ts files with `vscode.workspace.workspaceFolders` -> ts-blank-space -> js files

- WebView
  - `vscode.window.createWebviewPanel()` cannot register ServiceWorkers and
    cannot load external urls directly, so we need to load an iframe:

- iframe (takes role of dev server)
  - saves all the .js files to IndexedDB
  - loads JS module for the route in question
    (`import { GET } from ./index.js`, which is actually handled by ServiceWorker)
    and executes it

- ServiceWorker (takes role of the file system)
  - when request for JS comes in, loads it from IndexedDB
  - we cannot do much more here because:
    - ServiceWorkers are not allowed to do dynamic imports
    - fetch requests form inside the ServiceWorker cannot be handled by the ServiceWorker

*/

const getWebviewContent = () => {
  return `<!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title></title>
        <script type="module">
          window.addEventListener("message", event => {
            document.querySelector("iframe").contentWindow.postMessage(event.data, "*")
          })
        </script>
      </head>
      <body>
        <label>
          Path
          <input />
        </label>
        <iframe src="http://localhost:8000/">
      </body>
    </html>
    `
}

const readTextFile = async (uri: vscode.Uri): Promise<string> =>
  new TextDecoder().decode(await vscode.workspace.fs.readFile(uri))

const replaceTsImportsWithJs = (str: string) =>
  str.replace(/(^import {.*} from ['"].*)\.ts(['"]);?$/mg, "$1.js$2")
