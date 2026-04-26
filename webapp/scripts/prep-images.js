// Copies the 151 original Pokémon PNGs and the 151 black-silhouette PNGs
// from the parent project folder into webapp/public/{pokemon,obscured}.
// Vite serves anything in /public verbatim, so this is what makes
// `./pokemon/N.png` and `./obscured/N.png` resolvable from the app.

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
    src: (n) => resolve(projectRoot, `${n}.png`),
    dst: (n) => resolve(webappRoot, 'public', 'pokemon', `${n}.png`),
  },
  {
    label: 'silhouettes',
    src: (n) => resolve(projectRoot, 'obscured', `${n}.png`),
    dst: (n) => resolve(webappRoot, 'public', 'obscured', `${n}.png`),
  },
]

for (const { label, src, dst } of targets) {
  mkdirSync(dirname(dst(1)), { recursive: true })
  let copied = 0
  let skipped = 0
  for (let n = 1; n <= TOTAL; n++) {
    const s = src(n)
    const d = dst(n)
    if (!existsSync(s)) {
      console.error(`missing source: ${s}`)
      process.exit(1)
    }
    // Skip if dest is up-to-date — keeps the dev loop snappy.
    if (existsSync(d) && statSync(d).mtimeMs >= statSync(s).mtimeMs) {
      skipped++
      continue
    }
    copyFileSync(s, d)
    copied++
  }
  console.log(`${label}: copied ${copied}, skipped ${skipped} (up-to-date)`)
}
