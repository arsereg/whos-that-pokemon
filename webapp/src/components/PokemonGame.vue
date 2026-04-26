<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { POKEMON } from '../data/pokemon.js'

const TOTAL = POKEMON.length

function sequentialOrder() {
  return Array.from({ length: TOTAL }, (_, i) => i + 1)
}

function shuffledOrder() {
  const arr = sequentialOrder()
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

// Default to a fresh shuffle so the first Pokémon isn't always Bulbasaur.
const order = ref(shuffledOrder())
const cursor = ref(0) // 0-based index into `order`
const revealed = ref(false)
const flashing = ref(false)
const shuffled = ref(true)

const currentId = computed(() => order.value[cursor.value])
const current = computed(() => POKEMON[currentId.value - 1])
const obscuredSrc = computed(
  () => `${import.meta.env.BASE_URL}obscured/${currentId.value}.png`,
)
const originalSrc = computed(
  () => `${import.meta.env.BASE_URL}pokemon/${currentId.value}.png`,
)
const idLabel = computed(() => `#${String(currentId.value).padStart(3, '0')}`)
const liveAnnouncement = computed(() =>
  revealed.value
    ? `Revelado: ${current.value.name}, número ${currentId.value}.`
    : 'Silueta mostrada.',
)

function reveal() {
  if (revealed.value) return
  revealed.value = true
  // Retrigger flash even on rapid clicks by resetting before re-setting.
  flashing.value = false
  requestAnimationFrame(() => {
    flashing.value = true
    setTimeout(() => (flashing.value = false), 600)
  })
}

function next() {
  cursor.value = (cursor.value + 1) % TOTAL
  revealed.value = false
}

function prev() {
  cursor.value = (cursor.value - 1 + TOTAL) % TOTAL
  revealed.value = false
}

function shuffle() {
  order.value = shuffledOrder()
  cursor.value = 0
  revealed.value = false
  shuffled.value = true
}

function reset() {
  order.value = sequentialOrder()
  cursor.value = 0
  revealed.value = false
  shuffled.value = false
}

// Keep the next handful of images in browser cache so transitions are instant.
function preloadAround(c) {
  for (let off = 0; off <= 2; off++) {
    const id = order.value[(c + off) % TOTAL]
    if (id == null) continue
    const o = new Image()
    o.src = `${import.meta.env.BASE_URL}obscured/${id}.png`
    const r = new Image()
    r.src = `${import.meta.env.BASE_URL}pokemon/${id}.png`
  }
}
watch(cursor, preloadAround, { immediate: true })
watch(order, () => preloadAround(cursor.value))

function handleKey(e) {
  const tag = e.target?.tagName
  if (tag === 'INPUT' || tag === 'TEXTAREA' || e.target?.isContentEditable) return
  switch (e.key) {
    case ' ':
    case 'Enter':
      e.preventDefault()
      revealed.value ? next() : reveal()
      break
    case 'ArrowRight':
    case 'n':
    case 'N':
      e.preventDefault()
      next()
      break
    case 'ArrowLeft':
    case 'p':
    case 'P':
      e.preventDefault()
      prev()
      break
    case 'r':
    case 'R':
      reset()
      break
    case 's':
    case 'S':
      shuffle()
      break
  }
}

onMounted(() => window.addEventListener('keydown', handleKey))
onUnmounted(() => window.removeEventListener('keydown', handleKey))
</script>

<template>
  <div
    class="flex-1 flex flex-col items-center justify-center w-full max-w-3xl mx-auto px-4 sm:px-8 py-8 sm:py-14 gap-6 sm:gap-12 overflow-hidden"
  >
    <header class="text-center w-full">
      <p
        class="text-fog-500 uppercase tracking-[0.3em] sm:tracking-[0.4em] text-[10px] sm:text-xs mb-3 font-medium flex items-center justify-center gap-2"
      >
        <span class="size-1.5 rounded-full bg-volt-400 dot-pulse shrink-0"></span>
        151 Originales · Región de Kanto
      </p>
      <h1
        class="title-shimmer font-display font-bold leading-[0.95] tracking-tight text-[clamp(1.375rem,6vw,3rem)] sm:text-5xl md:text-6xl"
      >
        ¿Quién es ese Pokémon?
      </h1>
      <p class="text-fog-500 text-sm sm:text-base mt-4 max-w-md mx-auto px-2">
        Adivina el Pokémon por su silueta. Revélalo cuando estés listo.
      </p>
    </header>

    <!-- Stage -->
    <div
      class="stage relative w-full max-w-[440px] aspect-square"
      :class="{ 'is-flashing': flashing }"
    >
      <!-- outer frame -->
      <div
        aria-hidden="true"
        class="absolute inset-0 rounded-[40px] bg-ink-800/50 backdrop-blur-sm border border-fog-100/10"
        style="
          box-shadow:
            0 30px 80px -20px rgba(0, 0, 0, 0.7),
            inset 0 1px 0 rgba(255, 255, 255, 0.06);
        "
      ></div>

      <!-- inner panel -->
      <div
        class="absolute inset-3 rounded-[32px] overflow-hidden border border-fog-100/5"
        style="
          background:
            radial-gradient(120% 90% at 50% 0%, rgba(80, 95, 175, 0.35) 0%, rgba(11, 16, 36, 0.85) 60%, rgba(7, 9, 26, 0.95) 100%);
        "
      >
        <!-- corner ticks -->
        <template v-for="(corner, i) in ['tl', 'tr', 'bl', 'br']" :key="corner">
          <span
            aria-hidden="true"
            class="absolute w-4 h-px bg-fog-100/30"
            :class="{
              'top-3 left-3': corner === 'tl',
              'top-3 right-3': corner === 'tr',
              'bottom-3 left-3': corner === 'bl',
              'bottom-3 right-3': corner === 'br',
            }"
          ></span>
          <span
            aria-hidden="true"
            class="absolute h-4 w-px bg-fog-100/30"
            :class="{
              'top-3 left-3': corner === 'tl',
              'top-3 right-3': corner === 'tr',
              'bottom-3 left-3': corner === 'bl',
              'bottom-3 right-3': corner === 'br',
            }"
          ></span>
        </template>

        <!-- corner labels -->
        <span
          class="absolute top-4 left-5 font-mono text-[11px] tracking-[0.2em] tabular text-volt-400 font-semibold"
          aria-label="Número de Pokédex"
        >
          {{ idLabel }}
        </span>

        <!-- image stack -->
        <div class="absolute inset-10 sm:inset-12">
          <Transition name="fade" mode="out-in">
            <div
              :key="`${currentId}-${revealed ? 'o' : 's'}`"
              :class="['layer', revealed ? 'original' : 'silhouette']"
            >
              <img
                :src="revealed ? originalSrc : obscuredSrc"
                :alt="
                  revealed
                    ? `${current.name}, el Pokémon`
                    : `Silueta del Pokémon ${idLabel}`
                "
                draggable="false"
              />
            </div>
          </Transition>
        </div>

        <!-- flash burst -->
        <div class="flash-burst" aria-hidden="true"></div>

        <!-- reveal name strip -->
        <Transition name="strip">
          <div
            v-if="revealed"
            class="absolute bottom-0 left-0 right-0 px-6 pt-10 pb-5 text-center pointer-events-none"
            style="
              background:
                linear-gradient(
                  to top,
                  rgba(7, 9, 26, 0.95) 10%,
                  rgba(11, 16, 36, 0.55) 60%,
                  rgba(11, 16, 36, 0) 100%
                );
            "
          >
            <p
              class="text-volt-400 text-[10px] uppercase tracking-[0.5em] font-semibold mb-1"
            >
              Es&hellip;
            </p>
            <p
              class="font-display font-bold text-2xl sm:text-3xl text-fog-100"
            >
              ¡{{ current.name }}!
            </p>
          </div>
        </Transition>
      </div>

      <!-- live region for screen readers -->
      <div role="status" aria-live="polite" class="sr-only">
        {{ liveAnnouncement }}
      </div>
    </div>

    <!-- Primary actions -->
    <div class="flex flex-col sm:flex-row gap-3 w-full max-w-md">
      <button
        type="button"
        class="flex-1 px-6 py-4 rounded-2xl font-display font-bold text-base tracking-wide uppercase transition-all duration-200"
        :class="
          revealed
            ? 'bg-fog-100/[0.04] text-fog-500 cursor-not-allowed border border-fog-100/10'
            : 'bg-volt-400 text-ink-950 hover:bg-volt-300 hover:scale-[1.02] active:scale-[0.98] border border-volt-500'
        "
        :style="
          revealed
            ? ''
            : 'box-shadow: 0 14px 40px -12px rgba(255, 217, 61, 0.55), inset 0 1px 0 rgba(255, 255, 255, 0.5);'
        "
        :disabled="revealed"
        :aria-pressed="revealed"
        @click="reveal"
      >
        {{ revealed ? 'Revelado ✓' : 'Revelar' }}
      </button>
      <button
        type="button"
        class="flex-1 px-6 py-4 rounded-2xl font-display font-bold text-base tracking-wide uppercase transition-all duration-200 bg-fog-100/[0.04] text-fog-100 hover:bg-fog-100/[0.09] hover:scale-[1.02] active:scale-[0.98] border border-fog-100/15"
        @click="next"
      >
        Siguiente →
      </button>
    </div>

    <!-- Secondary actions -->
    <div class="flex flex-wrap items-center justify-center gap-x-1 gap-y-2 text-xs sm:text-sm text-fog-500">
      <button
        type="button"
        class="px-3 py-2 rounded-lg hover:text-fog-100 hover:bg-fog-100/5 transition"
        @click="prev"
      >
        ← Anterior
      </button>
      <span class="text-fog-500/30" aria-hidden="true">·</span>
      <button
        type="button"
        class="px-3 py-2 rounded-lg hover:text-fog-100 hover:bg-fog-100/5 transition"
        :class="{ 'text-volt-400': shuffled }"
        @click="shuffle"
      >
        ⤳ Mezclar
      </button>
      <span class="text-fog-500/30" aria-hidden="true">·</span>
      <button
        type="button"
        class="px-3 py-2 rounded-lg hover:text-fog-100 hover:bg-fog-100/5 transition"
        @click="reset"
      >
        ↺ Reiniciar
      </button>
    </div>

    <!-- Shortcut hint -->
    <p class="hidden sm:flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[11px] text-fog-500/70 tracking-wider">
      <span>
        <kbd class="kbd">espacio</kbd>
        <span class="ml-1.5">revelar / siguiente</span>
      </span>
      <span class="text-fog-500/30">·</span>
      <span>
        <kbd class="kbd">←</kbd><kbd class="kbd ml-0.5">→</kbd>
        <span class="ml-1.5">navegar</span>
      </span>
      <span class="text-fog-500/30">·</span>
      <span>
        <kbd class="kbd">s</kbd>
        <span class="ml-1.5">mezclar</span>
      </span>
      <span class="text-fog-500/30">·</span>
      <span>
        <kbd class="kbd">r</kbd>
        <span class="ml-1.5">reiniciar</span>
      </span>
    </p>
  </div>
</template>

<style scoped>
.kbd {
  display: inline-block;
  padding: 2px 6px;
  font-family: ui-monospace, 'JetBrains Mono', monospace;
  font-size: 10px;
  color: var(--color-fog-100);
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-bottom-width: 2px;
  border-radius: 4px;
  line-height: 1;
}

/* Reveal name strip slides up + fades in, slightly delayed so flash peaks first. */
.strip-enter-active {
  transition:
    opacity 280ms ease 180ms,
    transform 320ms cubic-bezier(0.2, 0.8, 0.2, 1) 180ms;
}
.strip-leave-active {
  transition:
    opacity 200ms ease,
    transform 200ms ease;
}
.strip-enter-from {
  opacity: 0;
  transform: translateY(16px);
}
.strip-leave-to {
  opacity: 0;
  transform: translateY(8px);
}

/* sr-only utility (Tailwind provides one but ensure it's available with scoped CSS) */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
</style>
