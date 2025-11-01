<!-- HeaderEnterpriseComponent.vue -->
<template>
  <v-card elevation="1" rounded="xl" class="pa-4 mb-4">
    <v-card-text>
      <v-row dense align="center">
        <!-- Campo Nome -->
        <v-col cols="12" sm="4" md="2">
          <v-text-field
              v-model="filtros.name"
              label="Informe o nome da empresa..."
              variant="outlined"
              density="comfortable"
              clearable
              hide-details
          />
        </v-col>

        <!-- Campo CNPJ -->
        <v-col cols="12" sm="4" md="2">
          <v-text-field
              v-model="cnpjDisplay"
              label="Informe o CNPJ da empresa..."
              variant="outlined"
              density="comfortable"
              clearable
              hide-details
              placeholder="00.000.000/0000-00"
              maxlength="18"
          />
        </v-col>

        <v-col cols="12" sm="4" md="2">
          <v-text-field
              v-model="filtros.ownerName"
              label="Informe o nome do representante..."
              variant="outlined"
              density="comfortable"
              clearable
              hide-details
          />
        </v-col>

        <!-- Filtro Status -->
        <v-col cols="12" sm="6" md="3" class="d-flex align-center">
          <v-btn-toggle
              v-model="filtros.status"
              color="primary"
              variant="outlined"
              rounded="lg"
              mandatory
              class="w-100"
          >
            <v-btn value="ATIVO">Ativo</v-btn>
            <v-btn value="INATIVO">Inativo</v-btn>
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
import { ref, computed, watch } from "vue";

const emit = defineEmits(['cadastrar', 'filtrar']);

const filtros = ref({
  name: "",
  cnpj: "",
  ownerName: "",
  status: null,
});

const cnpjDisplay = ref("");

// Watch para formatar o CNPJ enquanto digita
watch(cnpjDisplay, (newValue) => {
  const numbers = newValue.replace(/\D/g, '');
  filtros.value.cnpj = numbers;
  cnpjDisplay.value = formatCNPJ(newValue);
});

function formatCNPJ(value) {
  if (!value) return '';
  const numbers = value.replace(/\D/g, '');

  if (numbers.length <= 2) return numbers;
  if (numbers.length <= 5) return `${numbers.slice(0, 2)}.${numbers.slice(2)}`;
  if (numbers.length <= 8) return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5)}`;
  if (numbers.length <= 12)
    return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5, 8)}/${numbers.slice(8)}`;
  return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5, 8)}/${numbers.slice(8, 12)}-${numbers.slice(12, 14)}`;
}

const temFiltrosAtivos = computed(() => {
  return (
      filtros.value.name ||
      filtros.value.cnpj ||
      filtros.value.ownerName ||
      filtros.value.status !== null
  );
});

const onFiltrar = () => {
  emit('filtrar', {
    name: filtros.value.name || null,
    cnpj: filtros.value.cnpj || null,
    ownerName: filtros.value.ownerName || null,
    status: filtros.value.status
  });
};

const limparFiltros = () => {
  filtros.value = {
    name: "",
    cnpj: "",
    ownerName: "",
    status: null,
  };
  cnpjDisplay.value = "";
  emit('filtrar', null);
};

defineExpose({ limparFiltros });
</script>