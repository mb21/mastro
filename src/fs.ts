const fs = typeof window === 'object'
  ? undefined
  : await import('node:fs/promises')

const vscodeExtensionFs = typeof window === 'object'
// deno-lint-ignore no-explicit-any
  ? (window as any).fs
  : undefined

/**
 * Reads the directory and lists its files non-recursively and ignoring symlinks.
 */
export const readDir = async (path: string): Promise<string[]> => {
  path = ensureSlash(path)
  return fs
    ? (await fs.readdir('.' + path, { withFileTypes: true }))
        .flatMap(file => file.isSymbolicLink() || file.isDirectory() ? [] : file.name)
    : vscodeExtensionFs.readDir(path)
}

export const readTextFile = (path: string): Promise<string> => {
  path = ensureSlash(path)
  return fs
    ? fs.readFile('.' + path, { encoding: 'utf8' })
    : vscodeExtensionFs.readTextFile(path)
}

const ensureSlash = (path: string) =>
  path.startsWith('/')
    ? path
    : '/' + path
