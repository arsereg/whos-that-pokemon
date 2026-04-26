// Copies static Pokémon assets (originals, silhouettes, cries) into
// webapp/public/* from the parent project folder. Vite serves anything in
// /public verbatim, so this is what makes `./pokemon/N.png`,
// `./obscured/N.png`, and `./cries/N.ogg` resolvable from the app.
//
// Originals + silhouettes are required (script errors if missing).
// Cries are optional: the 151 .ogg files live committed in webapp/public/cries
// already; this script only re-syncs them if the upstream PokeAPI/cries clone
// is present at ../cries.

import { mkdirSync, copyFileSync, existsSync, statSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const projectRoot = resolve(__dirname, '..', '..') // /pokemons
const webappRoot = resolve(__dirname, '..') //        /pokemons/webapp

const TOTAL = 151

const targets = [
  {
    label: 'originals',
    required: true,
    src: (n) => resolve(projectRoot, `${n}.png`),
    dst: (n) => resolve(webappRoot, 'public', 'pokemon', `${n}.png`),
  },
  {
    label: 'silhouettes',
    required: true,
    src: (n) => resolve(projectRoot, 'obscured', `${n}.png`),
    dst: (n) => resolve(webappRoot, 'public', 'obscured', `${n}.png`),
  },
  {
    label: 'cries',
    required: false,
    src: (n) => resolve(projectRoot, 'cries', 'cries', 'pokemon', 'latest', `${n}.ogg`),
    dst: (n) => resolve(webappRoot, 'public', 'cries', `${n}.ogg`),
  },
]

for (const { label, required, src, dst } of targets) {
  // If the source root for an optional bundle is missing, skip silently
  // (the committed copy in public/ stays as-is).
  if (!required && !existsSync(src(1))) {
    console.log(`${label}: source missing at ${src(1)}, skipping (using committed copies)`)
    continue
  }
  mkdirSync(dirname(dst(1)), { recursive: true })
  let copied = 0
  let skipped = 0
  for (let n = 1; n <= TOTAL; n++) {
    const s = src(n)
    const d = dst(n)
    if (!existsSync(s)) {
      if (required) {
        console.error(`missing source: ${s}`)
        process.exit(1)
      }
      continue
    }
    if (existsSync(d) && statSync(d).mtimeMs >= statSync(s).mtimeMs) {
      skipped++
      continue
    }
    copyFileSync(s, d)
    copied++
  }
  console.log(`${label}: copied ${copied}, skipped ${skipped} (up-to-date)`)
}
