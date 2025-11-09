<script setup>
import { computed, ref, watch } from "vue";
import PhoneNumberInput from "@/components/input/PhoneNumberInput.vue";
import {hasChanges} from "@/utils/compareObjects.js";
import DayLaborerService from "@/api/services/day-laborer/DayLaborerService.js";
import CpfInput from "@/components/input/CpfInput.vue";

const props = defineProps({
  mode: { type: String, default: "create" },
  modelValue: Object,
});

const emit = defineEmits(["update:modelValue", "submit", "cancel"]);
const form = ref({ ...props.modelValue });

watch(
    () => props.modelValue,
    (val) => {
      form.value = { ...val };
    },
    { deep: true }
);

const isReadOnly = computed(() => props.mode === "view");
const showStatus = computed(() => props.mode !== "create");

const snackbar = ref({ show: false, color: "success", message: "" });

function showSnackbar(message, color = "info") {
  snackbar.value = { show: true, color, message };
}

async function onSubmit() {
  if (props.mode === "create") {
    await createDiarista();
  } else if (props.mode === "edit") {
    await updateDiarista();
  }
}

async function createDiarista() {

  try {
    await DayLaborerService.create(form.value);
    showSnackbar("Diarista cadastrado com sucesso!", "success");
    setTimeout(() => {
      emit("submit");
    }, 500);
  } catch (error) {
    console.error(error);
    showSnackbar("Erro ao cadastrar diarista.", "error");
  }
}

async function updateDiarista() {
  const changed = hasChanges(props.modelValue, form.value);

  if (!changed) {
    showSnackbar("Nenhuma modificação foi feita.", "info");
    return;
  }

  try {
    await DayLaborerService.update(form.value.id, form.value);
    showSnackbar("Alterações salvas com sucesso!", "success");
    setTimeout(() => {
      emit("submit");
    }, 500);
  } catch (error) {
    console.error(error);
    showSnackbar("Erro ao salvar alterações.", "error");
  }
}
</script>

<template>
  <v-container class="d-flex justify-center align-center fill-height">
    <v-card
        class="pa-8 d-flex flex-column justify-center align-center fill-height bg-surface"
        elevation="2"
        rounded="xl"
        width="100%"
    >
      <div class="text-center mb-6">
        <h2 class="text-h5 font-weight-bold text-primary">DiarixPro</h2>
        <p class="text-body-2 text-grey-darken-1">
          {{
            props.mode === "create"
                ? "Cadastro de Diarista"
                : props.mode === "edit"
                    ? "Editar Diarista"
                    : "Dados do Diarista"
          }}
        </p>
      </div>

      <!-- Form -->
      <v-form @submit.prevent="onSubmit" class="d-flex flex-column gap-4" style="width: 90%">
        <v-text-field
            v-model="form.name"
            label="Nome do Diarista"
            density="comfortable"
            variant="outlined"
            :readonly="isReadOnly"
            :disabled="isReadOnly"
            :rules="[v => !!v || 'Campo obrigatório']"
            required
        />

        <CpfInput v-model="form.cpf" :readonly="isReadOnly" :required="true" />

        <PhoneNumberInput v-model="form.phoneNumber" :readonly="isReadOnly" :required="true" />

        <v-text-field
            v-model="form.pixKey"
            label="Chave do Pix"
            density="comfortable"
            variant="outlined"
            :readonly="isReadOnly"
            :disabled="isReadOnly"
            :rules="[v => !!v || 'Campo obrigatório']"
            required
        />

        <v-select
            v-if="showStatus"
            v-model="form.status"
            label="Status"
            density="comfortable"
            variant="outlined"
            :items="[
              { title: 'Ativo', value: 'ATIVO' },
              { title: 'Inativo', value: 'INATIVO' }
            ]"
            item-title="title"
            item-value="value"
            :readonly="isReadOnly"
            :disabled="isReadOnly"
        />

        <div class="mt-6 d-flex flex-column align-center gap-2">
          <v-btn
              v-if="props.mode !== 'view'"
              type="submit"
              color="primary"
              variant="flat"
              rounded="lg"
              class="text-capitalize"
              style="max-width: 250px; width: 100%"
          >
            {{ props.mode === "create" ? "Cadastrar" : "Salvar Alterações" }}
          </v-btn>

          <v-btn
              class="text-capitalize mt-3"
              color="grey"
              variant="tonal"
              rounded="lg"
              style="max-width: 250px; width: 100%"
              @click="emit('cancel')"
          >
            {{ props.mode === "edit" ? "Cancelar" : "Fechar" }}
          </v-btn>
        </div>
      </v-form>
    </v-card>

    <!-- Snackbar -->
    <v-snackbar
        v-model="snackbar.show"
        :color="snackbar.color"
        timeout="4000"
        location="top right"
        variant="flat"
    >
      {{ snackbar.message }}
    </v-snackbar>
  </v-container>
</template>
