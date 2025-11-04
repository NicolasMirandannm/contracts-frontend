<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import MoneyInput from '@/components/input/MoneyInput.vue';
import BaseDataTable from "@/components/table/BaseDataTable.vue";
import EnterpriseService from "@/api/services/enterprise/EnterpriseService.js";
import DayLaborerService from "@/api/services/day-laborer/DayLaborerService.js";
import DailyWageService from "@/api/services/daily-wage/DailyWageService.js";
import PaymentService from "@/api/services/payment/PaymentService.js";

// -------- Props/Emits --------
const props = defineProps({
  mode: { type: String, default: 'create' },
  modelValue: Object,
});
const emit = defineEmits(['update:modelValue', 'submit', 'cancel']);

// -------- Estado base --------
const now = new Date();
const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().substring(0, 10);
const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().substring(0, 10);
const today = now.toISOString().substring(0, 10);
const snackbar = ref({ show: false, color: "success", message: "" });
const carregando = ref(false);

function showSnackbar(message, color = "info") {
  snackbar.value = { show: true, color, message };
}

const form = ref({
  ...props.modelValue,
  diarist: '',
  enterprise: '',
  startDate: startOfMonth,
  endDate: endOfMonth,
  date: today,
  method: '',
  observations: '',
  value: 0,
  version: 0,
});

const selectedDiarist = computed(() => {
  if (props.mode === 'create' || !form.value.diarist) {
    return diarists.value.find(d => d.id === form.value.diarist) || { id: '', name: '', pixKey: '' }
  }
  return form.value.diarist;
});


const formRef = ref('');
const formValid = ref(false);
const isSubmitting = ref(false);
const isReadOnly = computed(() => props.mode === 'view');

// -------- Catálogos (mock) --------
const diarists = ref([]);
const enterprises = ref([]);
const catalogLoaded = ref({ diarists: false, enterprises: false });
const firstLoad = ref(false);

const paymentMethods = [
  { title: 'PIX', value: 'PIX' },
  { title: 'Dinheiro', value: 'DINHEIRO' },
  { title: 'Outro', value: 'OUTRO' },
];

// -------- Diárias --------
const availableDailyWages = ref([]);
const selectedIds = ref([]);

const allSelected = computed({
  get() {
    return (
        availableDailyWages.value.length > 0 &&
        availableDailyWages.value.every(dw => selectedIds.value.includes(dw.id))
    );
  },
  set(val) {
    if (val) {
      selectedIds.value = availableDailyWages.value.map(dw => dw.id);
    } else {
      selectedIds.value = [];
    }
  },
});


watch(
    () => props.modelValue,
    (val) => {
      if (!val) return;

      // Preenche o form de forma segura
      form.value = {
        ...val,
        diarist: val.dayLaborer || null,
        enterprise: val.enterprise?.id || null,
        startDate: val.startDate || startOfMonth,
        endDate: val.endDate || endOfMonth,
        date: val.date || today,
        method: val.method || null,
        observations: val.observations || null,
        value: val.value || 0,
        version: val.version,
      };

      // Se o pagamento já tiver diárias associadas
      if (Array.isArray(val.dailyWages) && val.dailyWages.length > 0) {
        availableDailyWages.value = val.dailyWages.map(dw => ({
          ...dw,
          enterprise: dw.enterprise || { id: null, name: '-' },
        }));
        selectedIds.value = val.dailyWages.map(dw => dw.id);
      } else {
        availableDailyWages.value = [];
        selectedIds.value = [];
      }
    },
    { immediate: true, deep: true }
);


watch(
    () => [form.value.diarist, form.value.enterprise, form.value.startDate, form.value.endDate],
    ([diarist, enterprise, startDate, endDate]) => {
      if (diarist && startDate && endDate) {
        fetchAvailableDailyWages(diarist, enterprise, startDate, endDate);
      }
    }
);


// total automático
watch(selectedIds, () => {
  const map = new Map(availableDailyWages.value.map(w => [w.id, w]));
  const total = selectedIds.value.reduce((acc, id) => {
    const w = map.get(id);
    const amount = w?.dayLaborerPaymentValue ?? w?.value ?? w?.baseDailyRate ?? 0;
    return acc + Number(amount || 0);
  }, 0);
  form.value.value = total;
}, { deep: true });


async function fetchDiarists() {
  firstLoad.value = true;
  if (catalogLoaded.value.diarists) return;

  try {
    const response = await DayLaborerService.findWithPendingPayments();
    diarists.value = Array.isArray(response)
        ? response
        : response?.content || [];
  } catch (error) {
    let msg = error?.response?.data?.message || "Erro desconhecido";
    showSnackbar("Erro ao buscar diáristas: " + msg, "error");
    diarists.value = [];
  }
  catalogLoaded.value.diarists = true;
}


async function fetchEnterprises() {
  if (catalogLoaded.value.enterprises) return;
  try {
    const response = await EnterpriseService.findAll();
    enterprises.value = Array.isArray(response)
        ? response
        : response?.content || [];
  } catch (error) {
    let msg = error?.response?.data?.message || "Erro desconhecido";
    showSnackbar("Erro ao buscar empresas: " + msg, "error");
    enterprises.value = [];
  }
  catalogLoaded.value.enterprises = true;
}

async function fetchAvailableDailyWages(diaristId, enterprise, startDate, endDate) {
  try {
    carregando.value = true;
    const params = {
      paymentStatus: 'NAO_PAGO',
      enterpriseId: enterprise ? enterprise.id : null,
      startDate: startDate,
      endDate: endDate
    };

    Object.keys(params).forEach(key => {
      if (params[key] === null || params[key] === '') {
        delete params[key];
      }
    });
    const response = await DailyWageService.findAllByDiarist(diaristId, params);
    availableDailyWages.value = Array.isArray(response)
        ? response
        : [];

  } catch (error) {
    let msg = error?.response?.data?.message || "Erro desconhecido";
    showSnackbar("Erro ao buscar diárias: " + msg, "error");
    availableDailyWages.value = [];
  } finally {
    carregando.value = false;
  }
}


onMounted(async () => {
  await fetchEnterprises();
});

// -------- Utils --------
function currencyBRL(n) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(n || 0));
}

async function onSubmit() {
  const { valid } = (await formRef.value?.validate()) || { valid: true };
  if (!valid) {
    showSnackbar("Por favor, corrija os erros do formulário", "error");
    return;
  }

  if (!form.value.diarist || selectedIds.value.length === 0) return;

  isSubmitting.value = true;
  const paymentDto = {
    dailyWages: selectedIds.value.map(id => ({id})),
    date: form.value.date,
    method: form.value.method,
    observations: form.value.observations,
    version: form.value.version
  };

  try {
    if (props.mode === "create") {
      const response = await PaymentService.create(paymentDto);
      const msg = `Pagamento de ${currencyBRL(response.value)} cadastrado com sucesso para o(a) diárista ${selectedDiarist.value.name}.`;
      showSnackbar(msg, "success");
      setTimeout(() => emit("submit"), 500);

    } else if (props.mode === "edit") {
      const response = await PaymentService.update(form.value.id, paymentDto);
      const msg = `Pagamento de ${currencyBRL(response.value)} atualizado com sucesso para o(a) diárista ${selectedDiarist.value.name}.`;
      showSnackbar(msg, "success");
      setTimeout(() => emit("submit"), 500);
    }

  } catch (error) {
    let msg = error?.response?.data?.message || "Erro desconhecido";
    showSnackbar("Erro ao processar pagamento: " + msg, "error");
  } finally {
    isSubmitting.value = false;
  }
}

function onCancel() {
  emit('cancel');
}

async function ensureDiaristsLoaded() {
  await fetchDiarists();
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
            props.mode === 'create' ? 'Cadastro de Pagamento' : props.mode === 'edit' ? 'Editar Pagamento' : 'Dados do Pagamento'
          }}
        </p>
      </div>

      <v-form ref="formRef" v-model="formValid" @submit.prevent="onSubmit" class="d-flex flex-column gap-4"
              style="width: 90%">
        <!-- Linha 1: Diarista + Empresa -->
        <v-row dense>
          <v-col cols="12" md="6">
            <v-select
                v-model="form.diarist"
                :items="diarists"
                item-title="name"
                item-value="id"
                label="Diarista"
                variant="outlined"
                density="comfortable"
                :readonly="isReadOnly"
                :disabled="isReadOnly"
                :loading="!catalogLoaded.diarists && firstLoad"
                @focus="ensureDiaristsLoaded"
                :rules="[v => !!v || 'Campo obrigatório']"
                required
            />
          </v-col>

          <v-col cols="12" md="6">
            <v-select
                v-model="form.enterprise"
                :items="enterprises"
                item-title="name"
                item-value="id"
                label="Empresa (opcional)"
                variant="outlined"
                density="comfortable"
                :readonly="isReadOnly"
                :disabled="isReadOnly"
            />
          </v-col>
        </v-row>

        <!-- Linha 2: Data inicial / Data final -->
        <v-row dense>
          <v-col cols="12" md="6">
            <v-text-field
                v-model="form.startDate"
                type="date"
                label="Data inicial das diárias"
                variant="outlined"
                density="comfortable"
                :readonly="isReadOnly"
                :disabled="isReadOnly"
                required
            />
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field
                v-model="form.endDate"
                type="date"
                label="Data final das diárias"
                variant="outlined"
                density="comfortable"
                :readonly="isReadOnly"
                :disabled="isReadOnly"
                required
            />
          </v-col>
        </v-row>

        <!-- Tabela de diárias -->
        <BaseDataTable
            v-if="availableDailyWages.length"
            class="mb-8 elevation-2"
            :headers="[
              { key: 'enterprise', label: 'Empresa', align: 'left', width: '45%' },
              { key: 'valuePaid', label: 'Valor', width: '20%' },
              { key: 'workDate', label: 'Data', width: '20%' }
            ]"
            :items="availableDailyWages"
            :showActions="true"
            :isReadOnly="isReadOnly"
            :scroll="true"
            :height="220"
        >
          <template #header-actions>
            <v-checkbox
                v-model="allSelected"
                hide-details density="compact" color="primary"
                :true-value="true" :false-value="false"
                :disabled="availableDailyWages?.length === 0 || isReadOnly"
            />
          </template>

          <template #cell-enterprise="{ item }">
            {{ item.enterprise?.name || '-' }}
          </template>

          <template #cell-valuePaid="{ value }">
            {{ currencyBRL(value) }}
          </template>

          <template #cell-workDate="{ value }">
            {{ value?.split('-').reverse().join('/') }}
          </template>

          <template #actions="{ item }">
            <v-checkbox
                v-model="selectedIds"
                :value="item.id"
                hide-details density="compact" color="primary"
                :disabled="isReadOnly"
            />
          </template>
        </BaseDataTable>

        <!-- Linha 3: Data pagamento + Método -->
        <v-row dense>
          <v-col cols="12" md="6">
            <v-text-field
                v-model="form.date"
                type="date"
                label="Data do pagamento"
                variant="outlined"
                density="comfortable"
                :readonly="isReadOnly"
                :disabled="isReadOnly"
                required
                :rules="[v => !!v || 'Campo obrigatório']"
            />
          </v-col>

          <v-col cols="12" md="6">
            <v-select
                v-model="form.method"
                :items="paymentMethods"
                item-title="title"
                item-value="value"
                label="Método de pagamento"
                variant="outlined"
                density="comfortable"
                :readonly="isReadOnly"
                :disabled="isReadOnly"
                required
                :rules="[v => !!v || 'Campo obrigatório']"
            />
          </v-col>
        </v-row>

        <v-row dense>
          <v-col cols="12" md="3">
            <MoneyInput
                v-model="form.value"
                label="Valor total do pagamento"
                :readonly="true"
                :disabled="true"
                :rules="[v => !!v || 'Campo obrigatório']"
            />
          </v-col>

          <v-col cols="12" md="3">
            <v-text-field
                v-model="selectedIds.length"
                label="Quantidade de diárias"
                variant="outlined"
                density="comfortable"
                :readonly="true"
                :disabled="true"
            />
          </v-col>

          <v-col cols="12" md="6">
            <v-text-field
                v-model="selectedDiarist.pixKey"
                label="Chave PIX do diarista"
                variant="outlined"
                density="comfortable"
                :readonly="true"
                :disabled="true"
            />
          </v-col>
        </v-row>

        <!-- Observações -->
        <v-textarea
            v-model="form.observations"
            label="Observações"
            density="compact"
            variant="outlined"
            :readonly="isReadOnly"
            :disabled="isReadOnly"
            rows="2"
            max-rows="4"
        />

        <!-- Botões -->
        <div class="mt-6 d-flex flex-column align-center gap-2">
          <v-btn
              v-if="props.mode !== 'view'"
              type="submit"
              color="primary"
              variant="flat"
              rounded="lg"
              class="text-capitalize"
              style="max-width: 250px; width: 100%"
              :disabled="!formValid || isSubmitting || selectedIds.length === 0 || !form.diarist"
              :loading="isSubmitting"
          >
            {{ props.mode === 'create' ? 'Cadastrar' : 'Salvar Alterações' }}
          </v-btn>
          <v-btn
              class="text-capitalize mt-3"
              color="grey"
              variant="tonal"
              rounded="lg"
              style="max-width: 250px; width: 100%"
              @click="onCancel"
          >
            {{ props.mode === 'edit' ? 'Cancelar' : 'Fechar' }}
          </v-btn>
        </div>
      </v-form>
    </v-card>

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

<style scoped>

.table-container {
  display: flex;
  flex-direction: column;
  border-radius: 12px;
  overflow: hidden;
  max-height: 200px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
}


.table-header {
  display: flex;
  position: sticky;
  top: 0;
  z-index: 2;
  border-bottom: 1px solid var(--v-border-color);
  background-color: rgb(var(--v-theme-surface2));
  min-height: 42px;
  align-items: center;
}


.header-cell {
  flex: 1;
  font-weight: 600;
  font-size: 0.875rem;
  text-transform: uppercase;
  justify-content: center;
  align-items: center;
  display: flex;
  background-color: rgb(var(--v-theme-surface2));
}

.table-body {
  display: flex;
  flex-direction: column;
}

.scrollable-body {
  flex: 1;
  overflow-y: auto;
  width: 100%;
  padding-right: 6px;
}

.table-row {
  display: flex;
  border-bottom: 1px solid var(--v-border-color);
  transition: background-color 0.2s;
}

.row-hover:hover {
  background-color: rgba(0, 0, 0, 0.03);
}

.body-cell {
  flex: 1;
  min-height: 42px;
  justify-content: center;
  align-items: center;
  display: flex;
}

.text-grey {
  color: var(--v-text-disabled);
}

.scrollable-body::-webkit-scrollbar {
  width: 8px;
}

.scrollable-body::-webkit-scrollbar-thumb {
  background-color: rgba(108, 108, 108, 0.6);
  border-radius: 10px;
}

.scrollable-body::-webkit-scrollbar-thumb:hover {
  background-color: rgba(108, 108, 108, 0.6);
}

.actions-cell {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0px;
}
</style>