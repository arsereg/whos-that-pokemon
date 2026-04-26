<script setup>
import { ref } from 'vue'
import WelcomeScreen from './components/WelcomeScreen.vue'
import PokemonGame from './components/PokemonGame.vue'

const started = ref(false)

// Module-scoped so it survives any re-render of App and can only be
// instantiated once. The intro mp3 plays exactly once, when the user
// first clicks "Comenzar a jugar".
let introAudio = null

function startGame() {
  if (started.value) return
  started.value = true
  if (!introAudio) {
    introAudio = new Audio(`${import.meta.env.BASE_URL}intro.mp3`)
    introAudio.volume = 0.7
    // Autoplay restrictions are satisfied: this runs from a user gesture.
    introAudio.play().catch(() => {})
  }
}
</script>

<template>
  <main class="min-h-svh w-full flex flex-col">
    <Transition name="page" mode="out-in">
      <WelcomeScreen v-if="!started" @start="startGame" />
      <PokemonGame v-else />
    </Transition>
  </main>
</template>

<style>
.page-enter-active,
.page-leave-active {
  transition:
    opacity 350ms ease,
    transform 450ms cubic-bezier(0.2, 0.8, 0.2, 1);
}
.page-enter-from {
  opacity: 0;
  transform: translateY(16px) scale(0.985);
}
.page-leave-to {
  opacity: 0;
  transform: translateY(-12px) scale(1.01);
}
</style>
