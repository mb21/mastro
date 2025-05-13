import { dirname } from "@std/path";
import { routes } from "./router.ts";

export interface StaticPath {
  params: Record<string, string>;
}

export const generateFiles = async () => {
  for (const page of await generatePages()) {
    const fileName = "dist" + removeRoutesAndServerTs(page.filePath) + ".html";
    await Deno.mkdir(dirname(fileName), { recursive: true });
    Deno.writeTextFile(fileName, page.output);
  }
  console.info("\nGenerated static site and wrote to dist/ folder.");
};

export const generatePages = async () => {
  const pages: Array<{ filePath: string; output: string }> = [];
  for await (const route of routes) {
    const { filePath } = route;
    const { GET, getStaticPaths } = await import(Deno.cwd() + filePath);
    if (typeof GET === "function") {
      const paths = typeof getStaticPaths === "function"
        ? replaceParams(filePath, await getStaticPaths())
        : [filePath];

      const newPages = await Promise.all(
        paths.map((p) => generatePage(p, GET)),
      );
      pages.push(...newPages.filter(isDefined));
    } else {
      console.warn(filePath + " should export a function named GET");
    }
  }
  return pages;
};

const generatePage = async (
  filePath: string,
  GET: (req: Request) => Promise<Response>,
) => {
  const req = new Request(filepathToUrl(filePath));
  const res = await GET(req);
  if (res instanceof Response) {
    const output = await res.text();
    return { filePath, output };
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

const filepathToUrl = (path: string) => {
  path = removeRoutesAndServerTs(path);
  if (path.endsWith("/index")) {
    path = path.slice(0, -5); // '/index' -> '/'
  }
  return "http://localhost" + path;
};

const removeRoutesAndServerTs = (path: string) => path.slice(7, -10);

const isDefined = <T>(val: T | undefined | null): val is T =>
  val !== undefined && val !== null;
