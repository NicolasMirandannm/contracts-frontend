<template>
  <v-card elevation="1" rounded="xl" class="pa-4 mb-4">
    <v-card-text>
      <v-row dense align="center" class="flex-wrap">
        <v-col cols="12" sm="4" md="3">
          <v-text-field
              v-model="filters.paymentId"
              label="Informe o ID do pagamento..."
              variant="outlined"
              density="comfortable"
              clearable
              hide-details
          />
        </v-col>

        <v-col cols="12" sm="4" md="3">
          <v-text-field
              v-model="filters.startDate"
              type="date"
              label="Data inicial"
              variant="outlined"
              density="comfortable"
              clearable
              hide-details
          />
        </v-col>

        <v-col cols="12" sm="4" md="3">
          <v-text-field
              v-model="filters.endDate"
              type="date"
              label="Data final"
              variant="outlined"
              density="comfortable"
              clearable
              hide-details
          />
        </v-col>

        <v-col
            cols="12"
            md="3"
            class="d-flex align-center justify-end flex-wrap"
        >
          <div class="d-flex align-center justify-end w-100 flex-wrap gap-2">
            <v-btn
                color="primary"
                variant="tonal"
                icon="mdi-magnify"
                @click="onFiltrar"
                class="ma-1"
            />

            <v-btn
                v-if="hasActiveFilters"
                color="error"
                variant="tonal"
                icon="mdi-close"
                @click="limparFiltros"
                class="ma-1"
            />

            <v-btn
                color="primary"
                variant="flat"
                prepend-icon="mdi-plus"
                rounded="lg"
                class="ma-1"
                @click="$emit('cadastrar')"
            >
              Cadastrar
            </v-btn>
          </div>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>


<script setup>
import { ref, defineEmits, computed } from 'vue';

const emit = defineEmits(['cadastrar', 'filtrar']);

const today = new Date();
const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
  .toISOString()
  .substring(0, 10);
const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)
  .toISOString()
  .substring(0, 10);


const filters = ref({
  paymentId: null,
  startDate: startOfMonth,
  endDate: endOfMonth,
});


const hasActiveFilters = computed(() => {
  return (
    filters.value.paymentId ||
    filters.value.startDate !== startOfMonth ||
    filters.value.endDate !== endOfMonth
  );
});


const onFiltrar = () => {
  emit('filtrar', {
    paymentId: filters.value.paymentId || null,
    startDate: filters.value.startDate || null,
    endDate: filters.value.endDate || null,
  });
};


const limparFiltros = () => {
  filters.value = {
    paymentId: '',
    startDate: startOfMonth,
    endDate: endOfMonth,
  };
  emit('filtrar', null);
};


defineExpose({ limparFiltros });
</script>