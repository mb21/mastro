import { build, emptyDir } from "@deno/dnt"

await emptyDir("./npm")

await build({
  entryPoints: [{
    name: "./reactive",
    path: "./src/reactive/reactive.ts"
  }],
  outDir: "./npm",
  shims: {
    // deno: true,
  },
  test: false,
  compilerOptions: {
    lib: ["ESNext", "DOM", "DOM.Iterable"],
    target: "Latest",
  },
  package: {
    name: "mastro",
    version: Deno.args[0],
    description: "Minimal web framework for MPAs.",
    license: "MIT",
    repository: {
      type: "git",
      url: "git+https://github.com/mb21/mastro.git",
    },
    bugs: {
      url: "https://github.com/mb21/mastro/issues",
    },
    dependencies: {
      "@maverick-js/signals": "^6.0.0",
    },
  },
  postBuild: async () => {
    // see https://github.com/denoland/dnt/issues/438
    const outFileName = "npm/esm/reactive/reactive.js"
    const outFile = await Deno.readTextFile(outFileName)
    const lines = outFile.split("\n")
    if (lines[0] === 'import "../_dnt.polyfills.js";') {
      await Deno.writeTextFile(outFileName, lines.slice(1).join("\n"))
    }

    // Deno.copyFileSync("LICENSE", "npm/LICENSE")
    Deno.copyFileSync("./src/reactive/README.md", "npm/README.md")
  },
})
