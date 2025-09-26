<template>
  <v-app>
    <v-main>
      <ThemeToggle />
      <router-view />
      <AlertSnackbar ref="alertRef" />
    </v-main>
  </v-app>
</template>

<script setup>
import ThemeToggle from "@/components/buttons/ThemeToggle.vue";
import AlertSnackbar from "@/components/error/AlertSnackbar.vue";
</script>
