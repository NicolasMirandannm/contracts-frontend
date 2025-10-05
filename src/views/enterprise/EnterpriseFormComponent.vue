<script setup>
import { computed, ref, watch } from "vue";
import CnpjInput from "@/components/input/CnpjInput.vue";
import PhoneNumberInput from "@/components/input/PhoneNumberInput.vue";

const props = defineProps({
  mode: { type: String, default: "create" }, // create | edit | view
  modelValue: Object,
});
const emit = defineEmits(["update:modelValue", "submit", "cancel"]);
const form = ref({ ...props.modelValue });

watch(() => props.modelValue, (val) => {
  form.value = { ...val };
}, { deep: true });

const isReadOnly = computed(() => props.mode === "view");
const showStatus = computed(() => props.mode !== "create");
</script>

<template>
  <v-container class="d-flex justify-center align-center fill-height">
    <v-card
        class="pa-8 d-flex flex-column justify-center align-center fill-height  bg-surface"
        elevation="2"
        rounded="xl"
        width="100%"
    >
    <div class="text-center mb-6">
        <h2 class="text-h5 font-weight-bold text-primary">DiarixPro</h2>
        <p class="text-body-2 text-grey-darken-1">
          {{ props.mode === 'create'
            ? 'Cadastro de Empresa'
            : props.mode === 'edit'
                ? 'Editar Empresa'
                : 'Dados da Empresa'
          }}
        </p>
      </div>

      <!-- Form -->
      <v-form @submit.prevent="emit('submit', form)" class="d-flex flex-column gap-4" style="width: 90%;">
        <v-text-field
            v-model="form.nome"
            label="Nome da Empresa"
            density="comfortable"
            variant="outlined"
            :readonly="isReadOnly"
            :disabled="isReadOnly"
            :rules="[v => !!v || 'Campo obrigatório']"
            required
        />

        <CnpjInput
            v-model="form.cnpj"
            :readonly="isReadOnly"
            :required="true"
        />

        <v-text-field
            v-model="form.representante"
            label="Representante Legal"
            density="comfortable"
            variant="outlined"
            :readonly="isReadOnly"
            :disabled="isReadOnly"
            :rules="[v => !!v || 'Campo obrigatório']"
            required
        />

        <v-text-field
            v-model="form.email"
            label="Email do Representante"
            type="email"
            density="comfortable"
            variant="outlined"
            :readonly="isReadOnly"
            :disabled="isReadOnly"
            :rules="[v => !!v || 'Campo obrigatório']"
            required
        />

        <PhoneNumberInput
            v-model="form.telefone"
            :readonly="isReadOnly"
            :required="true"
        />

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
            v-model="form.endereco"
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
              style="max-width: 250px; width: 100%;"
          >
            {{ props.mode === "create" ? "Cadastrar Empresa" : "Salvar Alterações" }}
          </v-btn>
          <v-btn class="text-capitalize mt-3"
              color="grey"
              variant="tonal"
              rounded="lg"
              style="max-width: 250px; width: 100%;"
              @click="emit('cancel')"
          >
            {{ props.mode === "edit" ? "Cancelar" : "Fechar" }}
          </v-btn>
        </div>
      </v-form>
    </v-card>
  </v-container>
</template>
