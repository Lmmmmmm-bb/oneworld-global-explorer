import fs from "node:fs"
import path from "node:path"
import process from "node:process"
import zlib from "node:zlib"

const projectRoot = process.cwd()
const outputDirectory = path.join(projectRoot, "dist")
const manifestPath = path.join(outputDirectory, ".vite", "manifest.json")

if (!fs.existsSync(manifestPath)) {
  throw new Error("Build manifest not found. Run the production build first.")
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"))
const entryKey = Object.keys(manifest).find((key) => manifest[key].isEntry)
const plannerKey = "src/features/planner/pages/planner-page.tsx"
const routeDataKey = "src/data/generated/route-data.compact.json"

if (!entryKey || !manifest[plannerKey] || !manifest[routeDataKey]) {
  throw new Error(
    "Expected entry, planner, or route-data manifest item is missing."
  )
}

const gzipSize = (file) =>
  zlib.gzipSync(fs.readFileSync(path.join(outputDirectory, file))).length

const collectStaticImports = (roots) => {
  const collected = new Set()

  const visit = (key) => {
    if (collected.has(key)) return
    collected.add(key)
    for (const imported of manifest[key]?.imports ?? []) visit(imported)
  }

  for (const root of roots) visit(root)
  return collected
}

const sumJavaScript = (keys) =>
  [...keys].reduce((total, key) => {
    const file = manifest[key]?.file
    return total + (file?.endsWith(".js") ? gzipSize(file) : 0)
  }, 0)

const shellFiles = collectStaticImports([entryKey])
const plannerFiles = collectStaticImports([plannerKey])
const plannerReadyFiles = new Set([...shellFiles, ...plannerFiles])
const cssFiles = manifest[entryKey].css ?? []

const sizes = {
  shellJavaScript: sumJavaScript(shellFiles),
  plannerReadyJavaScript: sumJavaScript(plannerReadyFiles),
  routeData: gzipSize(manifest[routeDataKey].file),
  css: cssFiles.reduce((total, file) => total + gzipSize(file), 0),
}
sizes.plannerReadyTotal =
  sizes.plannerReadyJavaScript + sizes.routeData + sizes.css

const kibibytes = (bytes) => `${(bytes / 1024).toFixed(1)} KiB`
const budgets = {
  shellJavaScript: 70 * 1024,
  plannerReadyJavaScript: 175 * 1024,
  routeData: 70 * 1024,
  css: 20 * 1024,
  plannerReadyTotal: 260 * 1024,
}

console.log("Production bundle budget (gzip)")
for (const [metric, budget] of Object.entries(budgets)) {
  const size = sizes[metric]
  const status = size <= budget ? "PASS" : "FAIL"
  console.log(
    `${status.padEnd(4)}  ${metric.padEnd(24)} ${kibibytes(size).padStart(10)} / ${kibibytes(budget)}`
  )
}
console.log(
  `      initial JS requests       ${[...shellFiles].filter((key) => manifest[key]?.file?.endsWith(".js")).length}`
)
console.log(
  `      planner-ready JS requests ${[...plannerReadyFiles].filter((key) => manifest[key]?.file?.endsWith(".js")).length}`
)

if (process.argv.includes("--check")) {
  const failures = Object.entries(budgets).filter(
    ([metric, budget]) => sizes[metric] > budget
  )
  if (failures.length > 0) {
    process.exitCode = 1
    console.error(
      `Bundle budget exceeded: ${failures.map(([metric]) => metric).join(", ")}`
    )
  }
}
