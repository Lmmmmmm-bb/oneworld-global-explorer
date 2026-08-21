import { mkdir, writeFile } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"

import airlogosPackage from "airlogos"

const carrierCodes = [
  "AA",
  "AS",
  "AT",
  "AY",
  "BA",
  "CX",
  "EI",
  "FJ",
  "GK",
  "IB",
  "JL",
  "JQ",
  "MH",
  "NU",
  "PG",
  "QF",
  "QR",
  "RJ",
  "UL",
  "WS",
  "WY",
]

const airlineLogos = airlogosPackage.default ?? airlogosPackage
const outputDirectory = fileURLToPath(
  new URL("../../public/airlines/", import.meta.url)
)

await mkdir(outputDirectory, { recursive: true })

for (const code of carrierCodes) {
  const png = airlineLogos[code]?.png
  const encodedImage = png?.match(/^data:image\/png;base64,(.+)$/)?.[1]

  if (!encodedImage) {
    throw new Error(`airlogos does not contain a PNG for ${code}`)
  }

  await writeFile(
    path.join(outputDirectory, `${code}.png`),
    Buffer.from(encodedImage, "base64")
  )
}

console.log(`Updated ${carrierCodes.length} airline logos in public/airlines`)
