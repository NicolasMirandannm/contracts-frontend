<template>
  <v-app >
    <v-app-bar flat density="comfortable">
      <v-toolbar-title class="text-h5 font-weight-bold text-primary">
        DiarixPro
      </v-toolbar-title>

      <div class="d-flex align-center pa-3" style="gap: 12px;">
        <v-chip variant="outlined" color="primary" size="small" rounded="lg">
          Bem vindo, Nicolas
        </v-chip>
        <v-btn color="error" variant="tonal" size="small" rounded="lg">Logout</v-btn>
      </div>
    </v-app-bar>

    <v-main>
      <v-container fluid class="py-4">
        <v-row dense class="mb-4">
          <v-col
              cols="12"
              sm="6"
              md="3"
              v-for="card in resumo"
              :key="card.titulo"
          >
            <v-card
                elevation="2"
                class="pa-4 text-center d-flex flex-column align-center justify-center"
                rounded="xl"
            >
              <div class="text-subtitle-2">{{ card.titulo }}</div>
              <div class="text-h6 font-weight-bold mt-1" :class="card.cor">
                {{ card.valor }}
              </div>
            </v-card>
          </v-col>
        </v-row>

        <!-- ABAS -->
        <v-tabs
            v-model="abaSelecionada"
            color="deep-purple-accent-3"
            align-tabs="center"
            grow
        >
          <v-tab value="empresas">Empresas</v-tab>
          <v-tab value="diaristas">Diaristas</v-tab>
          <v-tab value="contratos">Contratos</v-tab>
          <v-tab value="diarias">Diárias</v-tab>
          <v-tab value="relatorios">Relatórios</v-tab>
        </v-tabs>

        <v-window v-model="abaSelecionada" class="mt-4" :touch="false">
          <v-window-item value="empresas">
            <Enterprise />
          </v-window-item>

          <v-window-item value="diaristas">
            <v-card rounded="xl" elevation="1" class="pa-4">
              <v-card-title class="font-weight-bold">TODO</v-card-title>
            </v-card>
          </v-window-item>

          <v-window-item value="contratos">
            <v-card rounded="xl" elevation="1" class="pa-4">
              <v-card-title class="font-weight-bold">TODO</v-card-title>
            </v-card>
          </v-window-item>

          <v-window-item value="diarias">
            <v-card rounded="xl" elevation="1" class="pa-4">
              <v-card-title class="font-weight-bold">TODO</v-card-title>
            </v-card>
          </v-window-item>

          <v-window-item value="relatorios">
            <v-card rounded="xl" elevation="1" class="pa-4">
              <v-card-title class="font-weight-bold">TODO</v-card-title>
            </v-card>
          </v-window-item>
        </v-window>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import { ref } from "vue";
import Enterprise from "@/views/enterprise/Enterprise.vue";

const abaSelecionada = ref("empresas");

const resumo = [
  { titulo: "Total Empresas", valor: "12", cor: "text-primary" },
  { titulo: "Total Diaristas", valor: "34", cor: "text-primary" },
  { titulo: "Contratos Ativos", valor: "27", cor: "text-primary" },
  { titulo: "Lucro Mês", valor: "R$ 4.000,00", cor: "text-success" },
];
</script>
