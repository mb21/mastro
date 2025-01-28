// import type * as Vscode from 'npm:@types/vscode' // doesn't seem to work
import * as fs from 'node:fs/promises'

// see https://code.visualstudio.com/api/references/vscode-api#FileSystem
// and https://github.com/microsoft/vscode-extension-samples/tree/main/fsconsumer-sample
const vscode = typeof require === 'function'
  ? require('vscode' as any)
  : undefined

/**
 * Reads the directory and lists its files non-recursively and ignoring symlinks.
 */
export const readDir = async (path: string): Promise<string[]> =>
  vscode
    ? (await vscode.workspace.fs.readDir(vscode.URI.file(path)))
        .flatMap(([name, type]) => type === vscode.FileType.File && type !== vscode.FilteType.SymbolicLink // TODO: check this
          ? name
          : []
        )
    : (await fs.readdir(path, { withFileTypes: true }))
        .flatMap(file => file.isSymbolicLink() || file.isDirectory() ? [] : file.name)

export const readTextFile = async (path: string): Promise<string> =>
  vscode
    ? new TextDecoder().decode(await vscode.workspace.fs.readFile(vscode.URI.file(path)))
    : fs.readFile(path, { encoding: 'utf8' })
