<template>
  <v-app>
    <v-app-bar flat>
      <v-toolbar-title class="text-h5 font-weight-bold">DiarixPro</v-toolbar-title>
      <v-spacer />
      <v-btn color="error" variant="tonal" class="mr-3" rounded="lg">Logout</v-btn>
      <v-chip variant="outlined" color="primary" rounded="lg">Olá, Gestor</v-chip>
    </v-app-bar>

    <!-- CONTEÚDO PRINCIPAL -->
    <v-main class="d-flex flex-column fill-height">
      <v-container fluid class="pa-6 d-flex flex-column fill-height">

        <div class="w-100 h-25">
          <v-row dense class="mb-6 w-100 h-75" align="stretch">
            <v-col cols="12" sm="6" md="3" v-for="card in resumo" :key="card.titulo">
              <v-card elevation="2" class="h-100 d-flex flex-column justify-center align-center text-center shadow-sm" rounded="xl">
                <div class="text-subtitle-2">{{ card.titulo }}</div>
                <div class="text-h5 font-weight-bold mt-2" :class="card.cor">{{ card.valor }}</div>
              </v-card>
            </v-col>
          </v-row>
        </div>

        <div class="w-100 h-75">

          <v-tabs v-model="abaSelecionada" color="deep-purple-accent-3" align-tabs="center" class="mb-6 w-100" style="height: 10%">
            <v-tab value="empresas">Empresas</v-tab>
            <v-tab value="diaristas">Diaristas</v-tab>
            <v-tab value="contratos">Contratos</v-tab>
            <v-tab value="diarias">Diárias</v-tab>
            <v-tab value="relatorios">Relatórios</v-tab>
          </v-tabs>

          <!-- CONTEÚDO DAS ABAS -->
          <v-window v-model="abaSelecionada" class=" w-100 " style="height: 90%">

            <v-window-item value="empresas" class="w-100 h-100" e>
              <Enterprise />
            </v-window-item>

            <v-window-item value="diaristas">
              <v-card
                  rounded="xl"
                  elevation="1"
                  class="d-flex flex-column flex-grow-1 w-100"
              >
                <v-card-title class="font-weight-bold">TODO</v-card-title>
              </v-card>
            </v-window-item>

            <v-window-item value="contratos">
              <v-card
                  rounded="xl"
                  elevation="1"
                  class="d-flex flex-column flex-grow-1 w-100"
              >
                <v-card-title class="font-weight-bold">TODO</v-card-title>
              </v-card>
            </v-window-item>

            <v-window-item value="diarias">
              <v-card
                  rounded="xl"
                  elevation="1"
                  class="d-flex flex-column flex-grow-1 w-100"
              >
                <v-card-title class="font-weight-bold">TODO</v-card-title>
              </v-card>
            </v-window-item>

            <v-window-item value="relatorios">
              <v-card
                  rounded="xl"
                  elevation="1"
                  class="d-flex flex-column flex-grow-1 w-100"
              >
                <v-card-title class="font-weight-bold">TODO</v-card-title>
              </v-card>
            </v-window-item>
          </v-window>
        </div>
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
