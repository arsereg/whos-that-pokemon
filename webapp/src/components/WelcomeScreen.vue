<script setup>
import { onMounted, ref } from 'vue'

defineEmits(['start'])

const startBtn = ref(null)

onMounted(() => {
  // Auto-focus the CTA so space/enter on the keyboard fire the button
  // natively — no separate keydown handler needed.
  startBtn.value?.focus()
})
</script>

<template>
  <section
    class="flex-1 flex flex-col items-center justify-center w-full max-w-3xl mx-auto px-4 sm:px-8 py-10 sm:py-14 gap-8 sm:gap-12 overflow-hidden"
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
    </header>

    <!-- Decorative stage-style preview -->
    <div
      class="relative w-full max-w-[300px] sm:max-w-[360px] aspect-square"
      aria-hidden="true"
    >
      <div
        class="absolute inset-0 rounded-[40px] bg-ink-800/50 backdrop-blur-sm border border-fog-100/10"
        style="
          box-shadow:
            0 30px 80px -20px rgba(0, 0, 0, 0.7),
            inset 0 1px 0 rgba(255, 255, 255, 0.06);
        "
      ></div>
      <div
        class="absolute inset-3 rounded-[32px] overflow-hidden border border-fog-100/5 flex items-center justify-center"
        style="
          background:
            radial-gradient(120% 90% at 50% 0%, rgba(80, 95, 175, 0.35) 0%, rgba(11, 16, 36, 0.85) 60%, rgba(7, 9, 26, 0.95) 100%);
        "
      >
        <span
          class="font-display font-bold text-fog-100/15 select-none"
          style="
            font-size: clamp(8rem, 30vw, 14rem);
            line-height: 1;
            text-shadow: 0 0 60px rgba(125, 145, 220, 0.45);
          "
        >
          ?
        </span>
      </div>
    </div>

    <div class="max-w-md text-center text-fog-300 text-base sm:text-lg leading-relaxed px-2">
      Te mostramos la silueta de los 151 Pokémon originales de Kanto.
      <span class="text-fog-100">¿Cuántos puedes reconocer antes de revelarlos?</span>
    </div>

    <button
      ref="startBtn"
      type="button"
      class="px-10 py-5 rounded-2xl font-display font-bold text-base sm:text-lg tracking-wide uppercase transition-all duration-200 bg-volt-400 text-ink-950 hover:bg-volt-300 hover:scale-[1.02] active:scale-[0.98] border border-volt-500"
      style="
        box-shadow:
          0 14px 40px -12px rgba(255, 217, 61, 0.55),
          inset 0 1px 0 rgba(255, 255, 255, 0.5);
      "
      @click="$emit('start')"
    >
      Comenzar a jugar
    </button>
  </section>
</template>
