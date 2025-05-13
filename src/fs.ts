const fs = typeof window === "object"
  ? undefined
  : await import("node:fs/promises");

const vscodeExtensionFs = typeof window === "object"
  // deno-lint-ignore no-explicit-any
  ? (window as any).fs
  : undefined;

/**
 * Reads the directory and lists its files non-recursively and ignoring symlinks.
 */
export const readDir = async (path: string): Promise<string[]> => {
  path = ensureLeadingSlash(path);
  return fs
    ? (await fs.readdir("." + path, { withFileTypes: true }))
      .flatMap((file) =>
        file.isSymbolicLink() || file.isDirectory() ? [] : file.name
      )
    : vscodeExtensionFs.readDir(path);
};

export const readTextFile = (path: string): Promise<string> => {
  path = ensureLeadingSlash(path);
  return fs
    ? fs.readFile("." + path, { encoding: "utf8" })
    : vscodeExtensionFs.readTextFile(path);
};

/**
 * Expands glob patterns like `*` and `**` and returns the matching file paths.
 *
 * Patterns supported currently depends on platform:
 *
 * - VSCode for the Web: [Glob Pattern](https://code.visualstudio.com/api/references/vscode-api#GlobPattern)
 * - Deno: [expandGlob](https://jsr.io/@std/fs/doc/expand-glob/~/expandGlob)
 */
export const findFiles = async (pattern: string): Promise<string[]> => {
  pattern = pattern.startsWith("/") ? pattern.slice(1) : pattern;
  if (typeof window === "object") {
    return vscodeExtensionFs.findFiles(pattern);
  } else {
    const { expandGlob } = await import("@std/fs");
    const paths = [];
    for await (const file of expandGlob(pattern)) {
      if (file.isFile && !file.isSymlink) {
        const relativeToProjectRoot = file.path.slice(Deno.cwd().length);
        paths.push(relativeToProjectRoot);
      }
    }
    return paths;
  }
};

const ensureLeadingSlash = (path: string) => path.startsWith("/") ? path : "/" + path;
