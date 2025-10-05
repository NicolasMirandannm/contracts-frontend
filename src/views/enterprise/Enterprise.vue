<script setup>
import HeaderEnterpriseComponent from "@/views/enterprise/HeaderEnterpriseComponent.vue";

const headers = [
  { title: "Data", key: "data" },
  { title: "Empresa", key: "empresa" },
  { title: "Diarista", key: "diarista" },
  { title: "Valor", key: "valor" },
  { title: "Status", key: "status" },
  { title: "Ações", key: "acoes", sortable: false },
];

const diarias = [
  { data: "15/09/2025", empresa: "ABC Serviços", diarista: "Maria Silva", valor: "R$ 150,00", status: "Pendente" },
  { data: "17/09/2025", empresa: "ABC Serviços", diarista: "Maria Silva", valor: "R$ 150,00", status: "Pago" },
  { data: "20/09/2025", empresa: "ABC Serviços", diarista: "Maria Silva", valor: "R$ 150,00", status: "Pendente" },
  { data: "21/09/2025", empresa: "ABC Serviços", diarista: "Maria Silva", valor: "R$ 150,00", status: "Pendente" },
];
</script>

<template>
  <div class="w-100 h-100">
    <HeaderEnterpriseComponent class="mb-4" />
    <v-card  elevation="1" class="d-flex flex-column flex-grow-1 w-100 h-75 shadow-sm">

      <!-- Data Table ocupa o resto da tela -->
      <v-data-table
          :headers="headers"
          :items="diarias"
          class="elevation-1 flex-grow-1 w-100"
          density="comfortable"
      >
        <template #item.status="{ item }">
          <v-chip
              :color="item.status === 'Pago' ? 'success' : 'warning'"
              variant="tonal"
              size="small"
          >
            {{ item.status }}
          </v-chip>
        </template>
        <template #item.acoes="{ item }">
          <v-btn
              size="small"
              variant="text"
              color="primary"
              prepend-icon="mdi-pencil"
          >
            Editar
          </v-btn>
        </template>
      </v-data-table>
    </v-card>
  </div>
</template>

<style scoped>

</style>