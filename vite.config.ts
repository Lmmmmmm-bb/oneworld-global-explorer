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
    rollupOptions: {
      input: {
        planner: path.resolve(import.meta.dirname, "index.html"),
        guide: path.resolve(import.meta.dirname, "guide/index.html"),
      },
      output: {
        manualChunks(id) {
          if (
            id.includes("/node_modules/react/") ||
            id.includes("/node_modules/react-dom/") ||
            id.includes("/node_modules/scheduler/")
          ) {
            return "react-core"
          }
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
