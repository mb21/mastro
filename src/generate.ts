import { findFiles } from "./fs.ts";
import { routes } from "./router.ts";

export interface StaticPath {
  params: Record<string, string>;
}

/**
 * On Deno, call this function to generate the whole
 * static site and write the files to disk.
 */
export const generate = async (outFolder = "dist") => {
  const { exists } = await import("@std/fs/exists");
  const { dirname } = await import("@std/path");

  if (await exists(outFolder, { isDirectory: true })) {
    await Deno.remove(outFolder, { recursive: true });
  }

  for (const { filePath } of routes) {
    const module = await import(Deno.cwd() + filePath);

    for (const file of await generatePagesForRoute(filePath, module)) {
      if (file) {
        const outFilePath = outFolder + file.outFilePath;
        await Deno.mkdir(dirname(outFilePath), { recursive: true });
        Deno.writeTextFile(outFilePath, file.output);
      }
    }
  }

  for (const filePath of await getStaticFilePaths()) {
    Deno.copyFile("routes" + filePath, outFolder + filePath);
  }

  console.info(`Generated static site and wrote to ${outFolder}/ folder.`);
};

export const generatePagesForRoute = async (filePath: string, module: any) => {
  const { GET, getStaticPaths } = module;
  if (typeof GET === "function") {
    const paths = typeof getStaticPaths === "function"
      ? replaceParams(filePath, await getStaticPaths())
      : [filePath];

    return Promise.all(paths.map((p) => generatePage(p, GET)));
  } else {
    throw Error(filePath + " should export a function named GET");
  }
};

export const getStaticFilePaths = async () =>
  (await findFiles("routes/**/*"))
    .filter(isStaticFile).map((p) => p.slice(7));

const isStaticFile = (p: string) =>
  !p.endsWith(".server.ts") && !p.endsWith(".server.js") &&
  !p.endsWith("/.DS_Store");

const generatePage = async (
  filePath: string,
  GET: (req: Request) => Promise<Response>,
) => {
  const req = new Request(filePathToUrlPath(filePath));
  const res = await GET(req);
  if (res instanceof Response) {
    const output = await res.text();
    return {
      outFilePath: removeRoutesAndServerTs(filePath) + ".html",
      output,
    };
  } else {
    console.warn(filePath + ": GET must return a Response object");
  }
};

const replaceParams = (path: string, staticPaths: StaticPath[]): string[] => {
  const params = path.match(/\[([^\]]+)]/g) || [];
  return staticPaths.map((p) =>
    params.reduce((acc, paramWithBrackets) => {
      const param = paramWithBrackets.slice(1, -1);
      return acc.replace(paramWithBrackets, p.params[param]);
    }, path)
  );
};

const filePathToUrlPath = (path: string) => {
  path = removeRoutesAndServerTs(path);
  if (path.endsWith("/index")) {
    path = path.slice(0, -5); // '/index' -> '/'
  }
  return "http://localhost" + path;
};

const removeRoutesAndServerTs = (path: string) => path.slice(7, -10);
