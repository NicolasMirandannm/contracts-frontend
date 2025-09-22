<template>
  <v-app>
    <router-view />
    <AlertSnackbar ref="alertRef" />
  </v-app>
</template>

<script setup>
import AlertSnackbar from "@/components/error/AlertSnackbar.vue";
</script>

<style>
v-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}
</style>
