import { StrictMode } from "react"
import { createRoot, hydrateRoot } from "react-dom/client"

import { GuideApp } from "./guide-app.tsx"
import "./guide.css"

const root = document.getElementById("guide-root")

if (!root) throw new Error("Guide root element was not found")

const app = (
  <StrictMode>
    <GuideApp />
  </StrictMode>
)

if (root.hasChildNodes()) hydrateRoot(root, app)
else createRoot(root).render(app)
