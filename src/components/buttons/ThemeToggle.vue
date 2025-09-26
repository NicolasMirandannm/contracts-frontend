<template>
  <v-btn
      class="theme-toggle"
      icon
      color="primary"
      @click="toggleTheme"
      :aria-label="theme.global.current.value.dark ? 'Tema claro' : 'Tema escuro'"
  >
    <v-icon>
      {{ theme.global.current.value.dark ? 'mdi-white-balance-sunny' : 'mdi-moon-waxing-crescent' }}
    </v-icon>
  </v-btn>
</template>

<script setup>
import { useAppTheme } from "@/composables/useTheme.js";
const { theme, toggleTheme } = useAppTheme();
</script>

<style scoped>
.theme-toggle {
  position: fixed;
  top: 16px;
  left: 16px;
  z-index: 1100;
}
</style>