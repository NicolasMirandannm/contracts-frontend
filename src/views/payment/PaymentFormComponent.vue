<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import MoneyInput from '@/components/input/MoneyInput.vue';

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

const form = ref({
  ...props.modelValue,
  diarist: null,
  enterprise: null,
  startDate: startOfMonth,
  endDate: endOfMonth,
  date: today, // pré-preenchida com data atual
  method: null,
  observations: null,
  value: 0,
  version: null,
});

const selectedDiarist = computed(() =>
    diarists.value.find(d => d.id === form.value.diarist) || { id: null, name: '', pixKey: '' }
);


const formRef = ref(null);
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

// -------- Diárias (mock) --------
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

// -------- Mocks --------
function mockDelay(ms = 400) { return new Promise(r => setTimeout(r, ms)); }

async function fetchDiarists() {
  firstLoad.value = true;
  if (catalogLoaded.value.diarists) return;
  await mockDelay();
  diarists.value = [
    { id: 'd1', name: 'Ana Sousa', pixKey: '1234'},
    { id: 'd2', name: 'Bruno Lima', pixKey: null },
    { id: 'd3', name: 'Carla Mendes', pixKey: null },
  ];
  catalogLoaded.value.diarists = true;
}

async function fetchEnterprises() {
  if (catalogLoaded.value.enterprises) return;
  await mockDelay();
  enterprises.value = [
    { id: 'e1', name: 'Construsul Ltda' },
    { id: 'e2', name: 'ServLar Serviços' },
    { id: 'e3', name: 'Alfa Obras' },
  ];
  catalogLoaded.value.enterprises = true;
}

/**
 * Busca (mock) diárias disponíveis
 */
async function fetchAvailableDailyWages() {
  if (!form.value.diarist || !form.value.startDate || !form.value.endDate) {
    availableDailyWages.value = [];
    selectedIds.value = [];
    return;
  }

  await mockDelay();
  const base = [
    { id: 'w1', enterprise: { id: 'e1', name: 'Construsul Ltda' }, dayLaborerPaymentValue: 180, workDate: '2025-11-01', dayLaborerId: 'd1' },
    { id: 'w2', enterprise: { id: 'e2', name: 'ServLar Serviços' }, dayLaborerPaymentValue: 200, workDate: '2025-11-03', dayLaborerId: 'd1' },
    { id: 'w3', enterprise: { id: 'e1', name: 'Construsul Ltda' }, dayLaborerPaymentValue: 180, workDate: '2025-11-06', dayLaborerId: 'd1' },
    { id: 'w4', enterprise: { id: 'e3', name: 'Alfa Obras' }, dayLaborerPaymentValue: 220, workDate: '2025-11-10', dayLaborerId: 'd1' },
    { id: 'w5', enterprise: { id: 'e2', name: 'ServLar Serviços' }, dayLaborerPaymentValue: 200, workDate: '2025-11-12', dayLaborerId: 'd1' },
    { id: 'w1', enterprise: { id: 'e1', name: 'Construsul Ltda' }, dayLaborerPaymentValue: 180, workDate: '2025-11-01', dayLaborerId: 'd1' },
    { id: 'w2', enterprise: { id: 'e2', name: 'ServLar Serviços' }, dayLaborerPaymentValue: 200, workDate: '2025-11-03', dayLaborerId: 'd1' },
    { id: 'w3', enterprise: { id: 'e1', name: 'Construsul Ltda' }, dayLaborerPaymentValue: 180, workDate: '2025-11-06', dayLaborerId: 'd1' },
    { id: 'w4', enterprise: { id: 'e3', name: 'Alfa Obras' }, dayLaborerPaymentValue: 220, workDate: '2025-11-10', dayLaborerId: 'd1' },
    { id: 'w5', enterprise: { id: 'e2', name: 'ServLar Serviços' }, dayLaborerPaymentValue: 200, workDate: '2025-11-12', dayLaborerId: 'd1' }
  ];

  const inRange = d => d >= form.value.startDate && d <= form.value.endDate;
  let rows = base.filter(w => w.dayLaborerId === form.value.diarist && inRange(w.workDate));
  if (form.value.enterprise) rows = rows.filter(w => w.enterprise.id === form.value.enterprise);

  availableDailyWages.value = rows;
}

watch(() => [form.value.diarist, form.value.enterprise, form.value.startDate, form.value.endDate], fetchAvailableDailyWages, { deep: true });

onMounted(async () => {
  await fetchEnterprises();
});

// -------- Utils --------
function currencyBRL(n) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(n || 0));
}

async function onSubmit() {
  const { valid } = (await formRef.value?.validate()) || { valid: true };
  if (!valid) return;

  if (!form.value.diarist || selectedIds.value.length === 0) return;

  isSubmitting.value = true;
  await new Promise(r => setTimeout(r, 500));
  emit('submit');
  isSubmitting.value = false;
}

function onCancel() { emit('cancel'); }

async function ensureDiaristsLoaded() { await fetchDiarists(); }
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
          {{ props.mode === 'create' ? 'Cadastro de Pagamento' : props.mode === 'edit' ? 'Editar Pagamento' : 'Dados do Pagamento' }}
        </p>
      </div>

      <v-form ref="formRef" v-model="formValid" @submit.prevent="onSubmit" class="d-flex flex-column gap-4" style="width: 90%">
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
        <v-card v-if="availableDailyWages.length" rounded="lg" class="mb-8 elevation-2">
          <div class="table-container">
            <div class="table-header">
              <div class="header-cell" style="width: 45%">Empresa</div>
              <div class="header-cell" style="width: 20%">Valor</div>
              <div class="header-cell" style="width: 20%">Data</div>
              <div class="header-cell" style="width: 15%">
                <v-checkbox
                    v-model="allSelected"
                    hide-details
                    density="compact"
                    :true-value="true"
                    :false-value="false"
                    :disabled="availableDailyWages.length === 0 || isReadOnly"
                />
              </div>
            </div>

            <div :class="['table-body', { 'scrollable-body': availableDailyWages.length >= 3 }]">
              <div
                  v-for="dw in availableDailyWages"
                  :key="dw.id"
                  class="table-row hover:bg-grey-lighten-5 transition-colors"
              >
                <div class="body-cell text-left"
                    style="width: 45%; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;"
                >
                  {{ dw.enterprise?.name || '-' }}
                </div>
                <div class="body-cell text-center" style="width: 20%">
                  {{ currencyBRL(dw.dayLaborerPaymentValue) }}
                </div>
                <div class="body-cell text-center" style="width: 20%">
                  {{ dw.workDate?.split('-').reverse().join('/') }}
                </div>
                <div class="body-cell text-center" style="width: 15%">
                  <v-checkbox
                      v-model="selectedIds"
                      :value="dw.id"
                      hide-details
                      density="compact"
                      :disabled="isReadOnly"
                  />
                </div>
              </div>
            </div>
          </div>
        </v-card>

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
            />
          </v-col>
        </v-row>

        <v-row dense>
          <v-col cols="12" md="6">
            <MoneyInput v-model="form.value" label="Valor total do pagamento" :readonly="true" :disabled="true" />
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
  </v-container>
</template>

<style scoped>

.table-container {
  display: flex;
  flex-direction: column;
  border-radius: 12px;
  overflow: hidden;
  max-height: 200px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.08);
  border: 2px solid rgba(var(--v-theme-borderColor), 0.8);
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
  background-color: rgba(0,0,0,0.03);
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