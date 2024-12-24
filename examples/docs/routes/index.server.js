import { Layout } from "../components/Layout.ts";
import { readMarkdownFile } from "mastro/markdown.ts";
import { htmlToResponse } from "mastro/routes.ts";

const { content } = await readMarkdownFile("/data/tutorial.md")

export const GET = () =>
  htmlToResponse(
    Layout({
      title: "Tutorial",
      children: content,
    }),
  );
