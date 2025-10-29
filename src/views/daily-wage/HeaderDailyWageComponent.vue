<template>
  <v-card elevation="1" rounded="xl" class="pa-4 mb-4">
    <v-card-text>
      <v-row dense align="center">
        <v-col cols="12" sm="4" md="2">
          <v-text-field
              v-model="filtros.dayLaborerName"
              label="Informe o nome do diarista..."
              variant="outlined"
              density="comfortable"
              clearable
              hide-details
          />
        </v-col>

        <v-col cols="12" sm="4" md="2">
          <v-text-field
              v-model="filtros.enterpriseName"
              label="Informe o nome da empresa..."
              variant="outlined"
              density="comfortable"
              clearable
              hide-details
          />
        </v-col>

        <v-col cols="12" sm="4" md="2">
          <v-text-field
              v-model="filtros.workDate"
              type="date"
              label="Informe a data da diária..."
              variant="outlined"
              density="comfortable"
              clearable
              hide-details
          />
        </v-col>

        <v-col cols="12" sm="6" md="3" class="d-flex align-center">
          <v-btn-toggle
              v-model="filtros.status"
              color="primary"
              variant="outlined"
              rounded="lg"
              mandatory
              class="w-100"
          >
            <v-btn value="PAGO">Pagas</v-btn>
            <v-btn value="NAO_PAGO">Não pagas</v-btn>
          </v-btn-toggle>
        </v-col>

        <v-col cols="12" sm="6" md="3" class="d-flex align-center justify-end gap-2">
          <div class="w-100 d-flex justify-center align-center">
            <v-btn
                color="primary"
                variant="tonal"
                prepend-icon="mdi-magnify"
                rounded="lg"
                @click="onFiltrar"
            >
              Filtrar
            </v-btn>

            <v-btn
                v-if="temFiltrosAtivos"
                color="red"
                variant="tonal"
                prepend-icon="mdi-close"
                rounded="lg"
                @click="limparFiltros"
            >
              Limpar filtros
            </v-btn>

            <v-spacer style="max-width: 24px" />
            <v-btn
                color="primary"
                variant="flat"
                prepend-icon="mdi-plus"
                rounded="lg"
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
import { ref, defineEmits, computed } from "vue";

const emit = defineEmits(['cadastrar', 'filtrar']);

const filtros = ref({
  dayLaborerName: "",
  enterpriseName: "",
  workDate: null,
  status: null,
});

const temFiltrosAtivos = computed(() => {
  return (
      filtros.value.dayLaborerName ||
      filtros.value.enterpriseName ||
      filtros.value.workDate ||
      filtros.value.status !== null
  );
});

const onFiltrar = () => {
  emit('filtrar', {
    dayLaborerName: filtros.value.dayLaborerName || null,
    enterpriseName: filtros.value.enterpriseName || null,
    workDate: filtros.value.workDate || null,
    status: filtros.value.status
  });
};

const limparFiltros = () => {
  filtros.value = {
    dayLaborerName: "",
    enterpriseName: "",
    workDate: null,
    status: null,
  };
  emit('filtrar', null);
};

defineExpose({ limparFiltros });
</script>