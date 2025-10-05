<template>
  <v-app>
    <v-main
        class="d-flex align-center justify-center bg-background"
        style="min-height: 100vh;"
    >
      <v-card
          class="pa-10 mx-4 text-center bg-surface"
          max-width="500"
          width="100%"
          elevation="3"
          rounded="xl"
      >
        <div class="mb-6">
          <h1 class="text-h2 font-weight-bold text-primary">404</h1>
          <p class="text-h6 text-secondary">Página não encontrada</p>
        </div>

        <p class="text-body-1 mb-6">
          Ops! A página que você está tentando acessar não existe.
          Clique no botão abaixo para voltar à tela inicial.
        </p>

        <v-btn
            color="primary"
            size="large"
            rounded="lg"
            @click="$router.push(RouteConstants.HOME)"
        >
          Voltar para Início
        </v-btn>
      </v-card>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import RouteConstants from "@/router/RouteConstants.js";
</script>