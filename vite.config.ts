import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { createElement } from "react"
import { renderToString } from "react-dom/server"
import { defineConfig, type Plugin } from "vite"

import { GuideApp } from "./src/guide/guide-app.tsx"

const prerenderGuide = (): Plugin => ({
  name: "prerender-guide",
  apply: "build",
  transformIndexHtml: {
    order: "pre",
    handler(html) {
      if (!html.includes("<!--guide-app-->")) return html

      return html.replace(
        "<!--guide-app-->",
        renderToString(createElement(GuideApp))
      )
    },
  },
})

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), prerenderGuide()],
  build: {
    rolldownOptions: {
      input: {
        planner: path.resolve(import.meta.dirname, "index.html"),
        guide: path.resolve(import.meta.dirname, "guide/index.html"),
      },
      output: {
        codeSplitting: {
          groups: [
            {
              name: "react-core",
              test: /node_modules[\\/](react|react-dom|scheduler)[\\/]/,
              priority: 20,
            },
            {
              name: "icons",
              // Leave the runtime and shell's error icon outside the group so
              // the loading/error screen does not preload workspace icons.
              test: /node_modules[\\/]lucide-react[\\/]dist[\\/]esm[\\/]icons[\\/](?!link-2-off\.mjs$)/,
              includeDependenciesRecursively: false,
              priority: 10,
            },
          ],
        },
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
})
