# Mastro SSG VS Code Extension

This is a VS Code [Web Extension](https://code.visualstudio.com/api/extension-guides/web-extensions) to build your static site inside your browser using vscode.dev or github.dev.

## Usage

Hit `Cmd-Shift-P` and search for `mastro`.

## Develop

1. In one terminal: `npm run watch`
2. In another terminal: `npm run open-in-browser`

See also [test your web extension](https://code.visualstudio.com/api/extension-guides/web-extensions#test-your-web-extension).

Note: since we're in a VS Code web extension (running in a [web worker](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API), we don't have access to Node's modules like `fs`. But we can use [`vscode.workspace.fs`](https://code.visualstudio.com/api/references/vscode-api#FileSystem) and [`vscode.Uri`](https://code.visualstudio.com/api/references/vscode-api#Uri).
