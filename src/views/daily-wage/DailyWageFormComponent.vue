<script setup>
import { computed, onMounted, ref, watch } from "vue";
import { hasChanges } from "@/utils/compareObjects.js";
import DayLaborerService from "@/api/services/day-laborer/DayLaborerService.js";
import EnterpriseService from "@/api/services/enterprise/EnterpriseService.js";
import DailyWageService from "@/api/services/daily-wage/DailyWageService.js";
import MoneyInput from "@/components/input/MoneyInput.vue";

const props = defineProps({
  mode: { type: String, default: "create" },
  modelValue: Object,
});

const emit = defineEmits(["update:modelValue", "submit", "cancel"]);

const form = ref({
  ...props.modelValue,
  enterprise: null,
  dayLaborer: null,
  workDay: null,
  startHour: null,
  endHour: null,
  version: null
});

const diaristas = ref([]);
const empresas = ref([]);
const selectedDiarists = ref([]);
const snackbar = ref({ show: false, color: "success", message: "" });
const isLoadingDiaristas = ref(false);
const showDiaristSelect = ref(false);

const isReadOnly = computed(() => props.mode === "view");
const formRef = ref(null);
const formValid = ref(false);
const isSubmitting = ref(false);
const hasDiarists = computed(() => selectedDiarists.value.length > 0);

const showDeleteAction = computed(() => props.mode === "create");

const canShowSearchButton = computed(() =>
    props.mode === "create" &&
    form.value.workDay &&
    form.value.startHour &&
    form.value.endHour &&
    validateEndHour(form.value.endHour) === true
);

const resetDiaristasSearch = () => {
  if (showDiaristSelect.value) {
    showDiaristSelect.value = false;
    diaristas.value = [];
    selectedDiarists.value = [];
    form.value.dayLaborer = null;
  }
};

function validateEndHour(value) {
  if (!form.value.startHour || !value) return true;

  const startToMinutes = (time) => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const startMinutes = startToMinutes(form.value.startHour);
  const endMinutes = startToMinutes(value);

  return endMinutes > startMinutes || 'A hora final deve ser maior que a hora inicial';
}

const fetchAvailableDiarists = async () => {
  isLoadingDiaristas.value = true;
  showDiaristSelect.value = false;

  try {
    const response = await DayLaborerService.findAvailable(
        form.value.workDay,
        form.value.startHour + ':00',
        form.value.endHour + ':00'
    );

    diaristas.value = Array.isArray(response)
        ? response
        : response?.content || [];

    showDiaristSelect.value = true;

    if (diaristas.value.length === 0) {
      showSnackbar("Nenhum diarista disponível para o período selecionado", "info");
    } else {
      showSnackbar(`${diaristas.value.length} diaristas encontrados`, "success");
    }

  } catch (error) {
    let msg = error?.response?.data?.message || "Erro desconhecido";
    showSnackbar("Erro ao buscar diaristas disponíveis: " + msg, "error");
    diaristas.value = [];
    showDiaristSelect.value = false;
  } finally {
    isLoadingDiaristas.value = false;
  }
};

const formatToLocalDate = (dateString) => {
  if (!dateString) return null;
  return dateString;
};

const formatToLocalTime = (timeString) => {
  if (!timeString) return null;
  return timeString.substring(0, 5);
};

watch(
    () => props.modelValue,
    (val) => {
      if (val) {
        form.value = {
          ...val,
          enterprise: val.enterprise?.id || null,
          workDay: val.workDate ? val.workDate.substring(0, 10) : null,
          startHour: val.startHour ? val.startHour.substring(0, 5) : null,
          endHour: val.endHour ? val.endHour.substring(0, 5) : null
        };

        if (val.dayLaborer) {
          selectedDiarists.value.push({
            id: val.dayLaborer.id,
            name: val.dayLaborer.name,
            dayLaborerPaymentValue: val.dayLaborerPaymentValue || 0,
            bonus: val.bonus || 0,
            deduction: val.deduction || 0
          });
        }
      }
    },
    { immediate: true, deep: true }
);

const startToMinutes = (time) => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

watch(
    () => form.value.startHour,
    (newStartHour, oldStartHour) => {
      if (newStartHour && form.value.endHour) {
        const startMinutes = startToMinutes(newStartHour);
        const endMinutes = startToMinutes(form.value.endHour);

        if (endMinutes <= startMinutes) {
          form.value.endHour = null;
        }
      }

      if (newStartHour !== oldStartHour) {
        resetDiaristasSearch();
      }
    }
);

watch(
    () => form.value.endHour,
    (newEndHour, oldEndHour) => {
      if (newEndHour !== oldEndHour) {
        resetDiaristasSearch();
      }
    }
);

watch(
    () => form.value.workDay,
    (newDate, oldDate) => {
      if (newDate !== oldDate) {
        resetDiaristasSearch();
      }
    }
);


watch(
    () => [form.value.enterprise, form.value.workDay, form.value.startHour, form.value.endHour],
    ([enterprise, workDay, startHour, endHour]) => {

      if (enterprise && workDay && startHour && endHour) {
        const startMinutes = startToMinutes(startHour);
        const endMinutes = startToMinutes(endHour);

        if (endMinutes > startMinutes) {
          fetchAvailableDiarists()
        }
      }
    }
);


watch(
    () => form.value.enterprise,
    (newEnterpriseId) => {
      if (newEnterpriseId && props.mode === "create") {
        const empresaSelecionada = empresas.value.find(emp => emp.id === newEnterpriseId);
        if (empresaSelecionada && empresaSelecionada.baseDailyRate) {
          form.value.baseDailyRate = empresaSelecionada.baseDailyRate;
        }
      }
    }
);

function addDiarist(diaristId) {
  const diarist = diaristas.value.find((d) => d.id === diaristId);
  if (diarist && !selectedDiarists.value.find((d) => d.id === diaristId)) {
    selectedDiarists.value.push({
      id: diarist.id,
      name: diarist.name,
      dayLaborerPaymentValue: diarist.dayLaborerPaymentValue || 0,
      bonus: 0,
      deduction: 0
    });
  }
  form.value.dayLaborer = null;
}

const availableDiaristas = computed(() => {
  const selectedIds = selectedDiarists.value.map(d => d.id);
  return diaristas.value.filter(diarist => !selectedIds.includes(diarist.id));
});

function removeDiarist(id) {
  selectedDiarists.value = selectedDiarists.value.filter((d) => d.id !== id);
}

function showSnackbar(message, color = "info") {
  snackbar.value = { show: true, color, message };
}

async function onSubmit() {
  const { valid } = await formRef.value?.validate() || { valid: true };
  if (!valid) {
    showSnackbar("Por favor, corrija os erros do formulário", "error");
    return;
  }

  if (form.value.startHour && form.value.endHour) {
    const validation = validateEndHour(form.value.endHour);
    if (validation !== true) {
      showSnackbar(validation, "error");
      return;
    }
  }

  isSubmitting.value = true;

  try {
    if (props.mode === "create") {
      const dailyWorkRegisterDto = {
        enterpriseId: form.value.enterprise,
        dayLaborers: selectedDiarists.value.map(diarist => ({
          dayLaborerId: diarist.id,
          dayLaborerPaymentValue: diarist.dayLaborerPaymentValue || 0,
          bonus: diarist.bonus || 0,
          deduction: diarist.deduction || 0
        })),
        workDate: formatToLocalDate(form.value.workDay),
        startHour: formatToLocalTime(form.value.startHour),
        endHour: formatToLocalTime(form.value.endHour),
        baseDailyRate: form.value.baseDailyRate,
        notes: form.value.notes,
      };
      await createDiaria(dailyWorkRegisterDto);

    } else if (props.mode === "edit") {
      const dailyWageDto = {
        id: form.value.id,
        enterprise: { id: form.value.enterprise },
        dayLaborer: { id: selectedDiarists.value[0]?.id },
        workDate: formatToLocalDate(form.value.workDay),
        startHour: formatToLocalTime(form.value.startHour),
        endHour: formatToLocalTime(form.value.endHour),
        baseDailyRate: form.value.baseDailyRate,
        bonus: selectedDiarists.value[0]?.bonus || 0,
        deduction: selectedDiarists.value[0]?.deduction || 0,
        dayLaborerPaymentValue: selectedDiarists.value[0]?.dayLaborerPaymentValue || 0,
        notes: form.value.notes,
        paymentStatus: form.value.paymentStatus,
        version: form.value.version
      };
      await updateDiaria(dailyWageDto);
    }

  } catch (error) {
    let msg = error?.response?.data?.message || "Erro desconhecido";
    showSnackbar("Erro ao processar diárias: " + msg, "error");
  } finally {
    isSubmitting.value = false;
  }
}

async function createDiaria(dailyWageDto) {
  try {
    await DailyWageService.create(dailyWageDto);
    showSnackbar("Diárias cadastradas com sucesso!", "success");
    setTimeout(() => emit("submit"), 500);
  } catch (error) {
    let msg = error?.response?.data?.message || "Erro desconhecido";
    showSnackbar("Erro ao cadastrar diárias: " + msg, "error");
    throw error;
  }
}

async function updateDiaria(dailyWageDto) {
  const changed = hasChanges(props.modelValue, dailyWageDto);
  if (!changed) {
    showSnackbar("Nenhuma modificação foi feita.", "info");
    return;
  }

  try {
    await DailyWageService.update(form.value.id, dailyWageDto);
    showSnackbar("Alterações salvas com sucesso!", "success");
    setTimeout(() => emit("submit"), 500);
  } catch (error) {
    let msg = error?.response?.data?.message || "Erro desconhecido";
    showSnackbar("Erro ao salvar alterações: " + msg, "error");
    throw error;
  }
}

onMounted(async () => {
  await loadEmpresas();
});

const loadEmpresas = async () => {
  try {
    const response = await EnterpriseService.findAll();
    empresas.value = Array.isArray(response)
        ? response
        : response?.content || [];
  } catch (error) {
    console.error("Erro ao buscar empresas:", error);
    empresas.value = [];
  }
};
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
                ? "Cadastro de Diária"
                : props.mode === "edit"
                    ? "Editar Diária"
                    : "Dados da Diária"
          }}
        </p>
      </div>

      <v-form ref="formRef" v-model="formValid" @submit.prevent="onSubmit" class="d-flex flex-column gap-4" style="width: 90%">
        <v-select
            v-model="form.enterprise"
            :items="empresas"
            item-title="name"
            item-value="id"
            label="Empresa"
            density="comfortable"
            variant="outlined"
            :readonly="isReadOnly || props.mode === 'edit'"
            :disabled="isReadOnly || props.mode === 'edit'"
            :rules="[v => !!v || 'Campo obrigatório']"
            required
        />

        <MoneyInput
            v-model="form.baseDailyRate"
            label="Valor Base da Diária"
            :readonly="isReadOnly"
            :disabled="isReadOnly"
            required
        />

        <v-row dense>
          <v-col cols="12" sm="4">
            <v-text-field
                v-model="form.workDay"
                type="date"
                label="Dia"
                density="comfortable"
                variant="outlined"
                :readonly="isReadOnly"
                :disabled="isReadOnly"
                :rules="[v => !!v || 'Campo obrigatório']"
                required
            />
          </v-col>

          <v-col cols="12" sm="4">
            <v-text-field
                v-model="form.startHour"
                type="time"
                label="Hora inicial"
                density="comfortable"
                variant="outlined"
                :readonly="isReadOnly"
                :disabled="isReadOnly"
                :rules="[v => !!v || 'Campo obrigatório']"
                required
            />
          </v-col>

          <v-col cols="12" sm="4">
            <v-text-field
                v-model="form.endHour"
                type="time"
                label="Hora final"
                density="comfortable"
                variant="outlined"
                :readonly="isReadOnly"
                :disabled="isReadOnly"
                :rules="[
                  v => !!v || 'Campo obrigatório',
                  validateEndHour
                ]"
                required
            />
          </v-col>
        </v-row>

        <v-select
            v-if="showDiaristSelect && availableDiaristas.length > 0"
            v-model="form.dayLaborer"
            :items="availableDiaristas"
            item-title="name"
            item-value="id"
            label="Selecione um Diarista"
            density="comfortable"
            variant="outlined"
            @update:modelValue="addDiarist"
            :readonly="isReadOnly"
            :disabled="isReadOnly"
            persistent-hint
        />

        <v-alert
            v-if="showDiaristSelect && availableDiaristas.length === 0 && selectedDiarists.length > 0"
            type="info"
            variant="tonal"
            class="mt-2"
        >
          Todos os diaristas disponíveis foram selecionados.
        </v-alert>

        <v-alert
            v-else-if="showDiaristSelect && availableDiaristas.length === 0 && selectedDiarists.length === 0"
            type="info"
            variant="tonal"
            class="mt-2"
        >
          Nenhum diarista disponível para o período selecionado.
        </v-alert>

        <!-- Tabela de diaristas -->
        <v-card v-if="selectedDiarists.length" rounded="lg" class="mb-3 elevation-2">
          <div class="table-container">
            <div class="table-header">
              <div class="header-cell">Nome</div>
              <div class="header-cell">Valor a Pagar</div>
              <div class="header-cell">Bônus</div>
              <div class="header-cell">Dedução</div>
              <div v-if="showDeleteAction" class="header-cell text-center">Ações</div>
            </div>

            <div :class="['table-body', { 'scrollable-body': selectedDiarists.length >= 3 }]">
              <div
                  v-for="d in selectedDiarists"
                  :key="d.id"
                  class="table-row"
                  :class="{ 'row-hover': !isReadOnly }"
              >
                <div class="body-cell" :class="{ 'text-grey': isReadOnly }">
                  {{ d.name }}
                </div>
                <div class="body-cell">
                  <MoneyInput
                      v-model="d.dayLaborerPaymentValue"
                      label=" "
                      :readonly="isReadOnly"
                      :disabled="isReadOnly"
                      density="compact"
                      variant="outlined"
                      class="mt-1"
                  />
                </div>
                <div class="body-cell">
                  <MoneyInput
                      v-model="d.bonus"
                      label=" "
                      :readonly="isReadOnly"
                      :disabled="isReadOnly"
                      density="compact"
                      variant="outlined"
                      class="mt-1"
                  />
                </div>
                <div class="body-cell">
                  <MoneyInput
                      v-model="d.deduction"
                      label=" "
                      :readonly="isReadOnly"
                      :disabled="isReadOnly"
                      density="compact"
                      variant="outlined"
                      class="mt-1"
                  />
                </div>
                <div v-if="showDeleteAction" class="body-cell actions-cell">
                  <v-btn
                      icon="mdi-delete"
                      color="red lighten-2"
                      size="small"
                      variant="text"
                      @click="removeDiarist(d.id)"
                      :disabled="isReadOnly"
                  />
                </div>
              </div>
            </div>
          </div>
        </v-card>

        <v-textarea
            v-model="form.notes"
            label="Observações"
            density="compact"
            variant="outlined"
            :readonly="isReadOnly"
            :disabled="isReadOnly"
            rows="2"
            max-rows="4"
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
              :disabled="!formValid || isSubmitting || !hasDiarists"
              :loading="isSubmitting"
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
  max-height: 235px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.08);
}

.table-header {
  display: flex;
  position: sticky;
  top: 0;
  z-index: 2;
  border-bottom: 1px solid var(--v-border-color);
}

.header-cell {
  flex: 1;
  padding: 10px 18px;
  font-weight: 600;
  font-size: 0.875rem;
  text-transform: uppercase;
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
  padding: 8px 16px;
  min-height: 42px;
  display: flex;
  align-items: center;
}

.text-grey {
  color: var(--v-text-disabled);
}

.scrollable-body::-webkit-scrollbar {
  width: 8px;
}

.scrollable-body::-webkit-scrollbar-thumb {
  background-color: rgba(100, 100, 100, 0.3);
  border-radius: 10px;
}

.scrollable-body::-webkit-scrollbar-thumb:hover {
  background-color: rgba(100, 100, 100, 0.6);
}

.actions-cell {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0px;
}
</style>