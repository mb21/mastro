import { Layout } from "../components/Layout.ts";
import { html, renderToStream } from "mastro/html.ts";
import { htmlResponse } from "mastro/routes.ts";

export const GET = () =>
  htmlResponse(renderToStream(
    Layout({
      title: "Kitchen Sink example",
      children: html`
        <tab-switch></tab-switch>

        <script type="module" src="x-kitchen-sink.client.ts"></script>
        `,
    }),
  ));
