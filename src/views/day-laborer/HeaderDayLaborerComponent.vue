<template>
  <v-card elevation="1" rounded="xl" class="pa-4 mb-4">
    <v-card-text>
      <v-row dense align="center">
        <v-col cols="12" sm="4" md="2">
          <v-text-field
              v-model="filtros.name"
              label="Informe o nome do diarista..."
              variant="outlined"
              density="comfortable"
              clearable
              hide-details
          />
        </v-col>

        <v-col cols="12" sm="4" md="2">
          <v-text-field
              v-model="cpfDisplay"
              label="Informe o CPF do diarista..."
              variant="outlined"
              density="comfortable"
              clearable
              hide-details
              placeholder="000.000.000-00"
              maxlength="14"
          />
        </v-col>

        <v-col cols="12" sm="4" md="2">
          <v-text-field
              v-model="phoneDisplay"
              label="Informe o contato..."
              variant="outlined"
              density="comfortable"
              clearable
              hide-details
              placeholder="(00) 00000-0000"
              maxlength="15"
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
            <v-btn value="ATIVO">Ativo</v-btn>
            <v-btn value="INATIVO">Inativo</v-btn>
          </v-btn-toggle>
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
                v-if="temFiltrosAtivos"
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
import { ref, defineEmits, computed, watch } from "vue";

const emit = defineEmits(['cadastrar', 'filtrar']);

const filtros = ref({
  name: "",
  cpf: "",
  phoneNumber: "",
  status: null,
});

const cpfDisplay = ref("");
const phoneDisplay = ref("");

watch(() => filtros.value.cpf, (newValue) => {
  cpfDisplay.value = formatCPF(newValue);
});

watch(() => filtros.value.phoneNumber, (newValue) => {
  phoneDisplay.value = formatPhone(newValue);
});

watch(cpfDisplay, (newValue) => {
  filtros.value.cpf = newValue.replace(/\D/g, '');
});

watch(phoneDisplay, (newValue) => {
  filtros.value.phoneNumber = newValue.replace(/\D/g, '');
});

function formatCPF(value) {
  if (!value) return '';
  const numbers = value.replace(/\D/g, '');
  if (numbers.length <= 3) return numbers;
  if (numbers.length <= 6) return `${numbers.slice(0, 3)}.${numbers.slice(3)}`;
  if (numbers.length <= 9) return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`;
  return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9, 11)}`;
}

function formatPhone(value) {
  if (!value) return '';
  const numbers = value.replace(/\D/g, '');
  if (numbers.length <= 2) return `(${numbers}`;
  if (numbers.length <= 6) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
  if (numbers.length <= 10) return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`;
  return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
}

const temFiltrosAtivos = computed(() => {
  return (
      filtros.value.name ||
      filtros.value.cpf ||
      filtros.value.phoneNumber ||
      filtros.value.status !== null
  );
});

const onFiltrar = () => {
  emit('filtrar', {
    name: filtros.value.name || null,
    cpf: filtros.value.cpf || null,
    phoneNumber: filtros.value.phoneNumber || null,
    status: filtros.value.status
  });
};

const limparFiltros = () => {
  filtros.value = {
    name: "",
    cpf: "",
    phoneNumber: "",
    status: null,
  };
  cpfDisplay.value = "";
  phoneDisplay.value = "";
  emit('filtrar', null);
};

defineExpose({ limparFiltros });
</script>
