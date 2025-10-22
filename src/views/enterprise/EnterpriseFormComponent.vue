<script setup>
import { computed, ref, watch } from "vue";
import CnpjInput from "@/components/input/CnpjInput.vue";
import PhoneNumberInput from "@/components/input/PhoneNumberInput.vue";
import EnterpriseService from "@/api/services/enterprise/EnterpriseService.js";

const props = defineProps({
  mode: { type: String, default: "create" }, // create | edit | view
  modelValue: Object,
});

const emit = defineEmits(["update:modelValue", "submit", "cancel"]);
const form = ref({ ...props.modelValue });

// Atualiza o form ao mudar o modelValue recebido do pai
watch(
    () => props.modelValue,
    (val) => {
      form.value = { ...val };
    },
    { deep: true }
);

const isReadOnly = computed(() => props.mode === "view");
const showStatus = computed(() => props.mode !== "create");

// Snackbar para mensagens amigáveis
const snackbar = ref({ show: false, color: "success", message: "" });

function showSnackbar(message, color = "info") {
  snackbar.value = { show: true, color, message };
}

// Função de submit principal
async function onSubmit() {
  if (props.mode === "create") {
    await createEmpresa();
  } else if (props.mode === "edit") {
    await updateEmpresa();
  }
}

// Criação de nova empresa
async function createEmpresa() {
  try {
    await EnterpriseService.create(form.value);
    emit("submit");
    showSnackbar("Empresa cadastrada com sucesso!", "success");
  } catch (error) {
    console.error(error);
    showSnackbar("Erro ao cadastrar empresa.", "error");
  }
}

// Atualização com verificação de alterações
async function updateEmpresa() {
  const changed = hasChanges(props.modelValue, form.value);

  if (!changed) {
    showSnackbar("Nenhuma modificação foi feita.", "info");
    return;
  }

  try {
    await EnterpriseService.update(form.value.id, form.value);
    emit("submit");
    showSnackbar("Alterações salvas com sucesso!", "success");
  } catch (error) {
    console.error(error);
    showSnackbar("Erro ao salvar alterações.", "error");
  }
}

// 🔍 Compara dois objetos ignorando campos irrelevantes
function hasChanges(original, updated) {
  const ignoredFields = ["id", "createdAt", "updatedAt"];

  const clean = (obj) => {
    const clone = { ...obj };
    ignoredFields.forEach((f) => delete clone[f]);
    return clone;
  };

  const o = JSON.stringify(clean(original ?? {}));
  const u = JSON.stringify(clean(updated ?? {}));

  return o !== u;
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
                ? "Cadastro de Empresa"
                : props.mode === "edit"
                    ? "Editar Empresa"
                    : "Dados da Empresa"
          }}
        </p>
      </div>

      <!-- Form -->
      <v-form @submit.prevent="onSubmit" class="d-flex flex-column gap-4" style="width: 90%">
        <v-text-field
            v-model="form.name"
            label="Nome da Empresa"
            density="comfortable"
            variant="outlined"
            :readonly="isReadOnly"
            :disabled="isReadOnly"
            :rules="[v => !!v || 'Campo obrigatório']"
            required
        />

        <CnpjInput v-model="form.cnpj" :readonly="isReadOnly" :required="true" />

        <v-text-field
            v-model="form.ownerName"
            label="Representante Legal"
            density="comfortable"
            variant="outlined"
            :readonly="isReadOnly"
            :disabled="isReadOnly"
            :rules="[v => !!v || 'Campo obrigatório']"
            required
        />

        <v-text-field
            v-model="form.ownerEmail"
            label="Email do Representante"
            type="email"
            density="comfortable"
            variant="outlined"
            :readonly="isReadOnly"
            :disabled="isReadOnly"
            :rules="[v => !!v || 'Campo obrigatório']"
            required
        />

        <PhoneNumberInput v-model="form.ownerPhone" :readonly="isReadOnly" :required="true" />

        <v-select
            v-if="showStatus"
            v-model="form.status"
            label="Status"
            density="comfortable"
            variant="outlined"
            :items="['Ativo', 'Inativo']"
            :readonly="isReadOnly"
            :disabled="isReadOnly"
        />

        <v-textarea
            v-model="form.address"
            label="Endereço da Empresa"
            density="comfortable"
            variant="outlined"
            :readonly="isReadOnly"
            :disabled="isReadOnly"
            :rules="[v => !!v || 'Campo obrigatório']"
            required
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
            {{ props.mode === "create" ? "Cadastrar Empresa" : "Salvar Alterações" }}
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
        timeout="3000"
        location="bottom"
        variant="flat"
    >
      {{ snackbar.message }}
    </v-snackbar>
  </v-container>
</template>
