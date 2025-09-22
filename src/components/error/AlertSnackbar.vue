<template>
  <div class="snackbar-container">
    <v-snackbar
        v-for="(alert, index) in alerts"
        :key="alert.id"
        v-model="alert.visible"
        :timeout="alert.timeout"
        :color="alert.type"
        location="top right"
        elevation="2"
        class="snackbar-item"
        :style="{ top: `${index * 70 + 20}px` }"
    >
    <v-icon left>{{ alert.icon }}</v-icon>
    {{ alert.msg }}
    <template #actions>
      <v-btn icon @click="closeAlert(alert.id)">
        <v-icon>mdi-close</v-icon>
      </v-btn>
    </template>
    </v-snackbar>
  </div>
</template>

<script setup>
import { useAlert } from '@/composables/useAlert'

const { alerts, closeAlert } = useAlert()
</script>

<style scoped>
.snackbar-container {
  position: fixed;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  z-index: 2000;
}

.snackbar-item {
  margin-bottom: 10px;
}
</style>

