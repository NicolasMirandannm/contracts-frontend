<!--<script setup>-->
<!--import { ref, watch, computed } from "vue";-->
<!--import { mask } from "vue-the-mask"; // opcional para máscara de CNPJ/telefone-->

<!--// Props recebidas-->
<!--const props = defineProps({-->
<!--  mode: { type: String, default: "create" }, // create | edit | view-->
<!--  modelValue: {-->
<!--    type: Object,-->
<!--    default: () => ({-->
<!--      nome: "",-->
<!--      cnpj: "",-->
<!--      representante: "",-->
<!--      email: "",-->
<!--      telefone: "",-->
<!--      endereco: "",-->
<!--      status: ""-->
<!--    }),-->
<!--  },-->
<!--});-->

<!--// Emitir evento de atualização do formulário-->
<!--const emit = defineEmits(["update:modelValue", "submit", "cancel"]);-->

<!--const form = ref({ ...props.modelValue });-->

<!--// Atualiza sempre que props mudar (quando abre para editar ou visualizar)-->
<!--watch(-->
<!--    () => props.modelValue,-->
<!--    (val) => {-->
<!--      form.value = { ...val };-->
<!--    },-->
<!--    { deep: true }-->
<!--);-->

<!--// Controle de estado (se campos ficam readonly)-->
<!--const isReadOnly = computed(() => props.mode === "view");-->
<!--const showStatus = computed(() => props.mode !== "create");-->
<!--</script>-->

<!--<template>-->
<!--  <v-card class="pa-6" rounded="xl" elevation="2" max-width="600" width="100%">-->
<!--    <h2 class="text-h6 font-weight-bold mb-4">-->
<!--      {{ props.mode === "create" ? "Cadastrar Empresa" : props.mode === "edit" ? "Editar Empresa" : "Dados da Empresa" }}-->
<!--    </h2>-->

<!--    <v-form @submit.prevent="emit('submit', form)" class="d-flex flex-column gap-4">-->
<!--      <v-text-field-->
<!--          v-model="form.nome"-->
<!--          label="Nome da Empresa"-->
<!--          :readonly="isReadOnly"-->
<!--          :rules="[v => !!v || 'Campo obrigatório']"-->
<!--          required-->
<!--      />-->

<!--      <v-text-field-->
<!--          v-model="form.cnpj"-->
<!--          label="CNPJ"-->
<!--          :readonly="isReadOnly"-->
<!--          v-mask="'##.###.###/####-##'"-->
<!--          :rules="[v => !!v || 'Campo obrigatório']"-->
<!--          required-->
<!--      />-->

<!--      <v-text-field-->
<!--          v-model="form.representante"-->
<!--          label="Nome do Representante"-->
<!--          :readonly="isReadOnly"-->
<!--          :rules="[v => !!v || 'Campo obrigatório']"-->
<!--          required-->
<!--      />-->

<!--      <v-text-field-->
<!--          v-model="form.email"-->
<!--          label="Email do Representante"-->
<!--          type="email"-->
<!--          :readonly="isReadOnly"-->
<!--          :rules="[v => !!v || 'Campo obrigatório']"-->
<!--          required-->
<!--      />-->

<!--      <v-text-field-->
<!--          v-model="form.telefone"-->
<!--          label="Telefone do Representante"-->
<!--          :readonly="isReadOnly"-->
<!--          v-mask="'(##) #####-####'"-->
<!--          :rules="[v => !!v || 'Campo obrigatório']"-->
<!--          required-->
<!--      />-->

<!--      <v-textarea-->
<!--          v-model="form.endereco"-->
<!--          label="Endereço da Empresa"-->
<!--          :readonly="isReadOnly"-->
<!--          :rules="[v => !!v || 'Campo obrigatório']"-->
<!--          required-->
<!--      />-->

<!--      &lt;!&ndash; Status só aparece em edit/view &ndash;&gt;-->
<!--      <v-select-->
<!--          v-if="showStatus"-->
<!--          v-model="form.status"-->
<!--          label="Status"-->
<!--          :items="['Ativo', 'Inativo']"-->
<!--          :readonly="isReadOnly"-->
<!--      />-->

<!--      <div class="d-flex justify-end gap-2 mt-4">-->
<!--        <v-btn v-if="props.mode !== 'view'" type="submit" color="primary" rounded="lg">-->
<!--          {{ props.mode === "create" ? "Cadastrar" : "Salvar Alterações" }}-->
<!--        </v-btn>-->
<!--        <v-btn variant="tonal" color="secondary" rounded="lg" @click="emit('cancel')">Cancelar</v-btn>-->
<!--      </div>-->
<!--    </v-form>-->
<!--  </v-card>-->
<!--</template>-->

<template>
  <v-card class="pa-6" rounded="xl" elevation="2" max-width="600" width="100%">
    <h2 class="text-h6 font-weight-bold mb-4">
      {{ props.mode === "create" ? "Cadastrar Empresa" : props.mode === "edit" ? "Editar Empresa" : "Dados da Empresa" }}
    </h2>

    <v-form @submit.prevent="emit('submit', form)" class="d-flex flex-column gap-4">
      <v-text-field
          v-model="form.nome"
          label="Nome da Empresa"
          :readonly="isReadOnly"
          :rules="[v => !!v || 'Campo obrigatório']"
          required
      />

      <!-- Usa componente separado de CNPJ -->
      <CnpjInput
          v-model="form.cnpj"
          :readonly="isReadOnly"
          :required="true"
      />

      <v-text-field
          v-model="form.representante"
          label="Nome do Representante"
          :readonly="isReadOnly"
          :rules="[v => !!v || 'Campo obrigatório']"
          required
      />

      <v-text-field
          v-model="form.email"
          label="Email do Representante"
          type="email"
          :readonly="isReadOnly"
          :rules="[v => !!v || 'Campo obrigatório']"
          required
      />

      <v-text-field
          v-model="form.telefone"
          label="Telefone do Representante"
          :readonly="isReadOnly"
          :rules="[v => !!v || 'Campo obrigatório']"
          required
      />

      <v-textarea
          v-model="form.endereco"
          label="Endereço da Empresa"
          :readonly="isReadOnly"
          :rules="[v => !!v || 'Campo obrigatório']"
          required
      />

      <v-select
          v-if="showStatus"
          v-model="form.status"
          label="Status"
          :items="['Ativo', 'Inativo']"
          :readonly="isReadOnly"
      />

      <div class="d-flex justify-end gap-2 mt-4">
        <v-btn v-if="props.mode !== 'view'" type="submit" color="primary" rounded="lg">
          {{ props.mode === "create" ? "Cadastrar" : "Salvar Alterações" }}
        </v-btn>
        <v-btn variant="tonal" color="secondary" rounded="lg" @click="emit('cancel')">Cancelar</v-btn>
      </div>
    </v-form>
  </v-card>
</template>

<script setup>
import { ref, watch, computed } from "vue";
import CnpjInput from "@/components/input/CnpjInput.vue";


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
