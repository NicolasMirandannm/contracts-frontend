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
});

const diaristas = ref([]);
const empresas = ref([]);
const selectedDiarists = ref([]);
const snackbar = ref({ show: false, color: "success", message: "" });

const isReadOnly = computed(() => props.mode === "view");
const showStatus = computed(() => props.mode !== "create");
const formRef = ref(null);
const formValid = ref(false);
const isSubmitting = ref(false);
const hasDiarists = computed(() => selectedDiarists.value.length > 0);

const showDiaristSelect = computed(() => props.mode === "create");
const showDeleteAction = computed(() => props.mode === "create");

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

const formatToLocalDate = (dateString) => {
  if (!dateString) return null;
  return dateString;
};

const formatToLocalTime = (timeString) => {
  if (!timeString) return null;
  return timeString.substring(0, 5);
};

const canSelectDiarist = computed(() =>
    props.mode === "create" &&
    form.value.workDay &&
    form.value.startHour &&
    form.value.endHour &&
    validateEndHour(form.value.endHour) === true
);


watch(
    () => props.modelValue,
    (val) => {
      if (val) {
        form.value = {
          ...val,
          enterprise: val.enterprise?.id || null,
          workDay: val.workDate ? val.workDate.substring(0, 10) : null,
          startHour: val.startHour ? val.startHour.substring(0, 5) : null,
          endHour: val.endHour ? val.endHour.substring(0, 5) : null,
        };

        if (val.dayLaborer && val.dayLaborer.length > 0) {
          selectedDiarists.value = val.dayLaborer.map(diarist => ({
            id: diarist.id,
            name: diarist.name,
            cpf: diarist.cpf,
            phoneNumber: diarist.phoneNumber,
            status: diarist.status,
            pixKey: diarist.pixKey,
            version: diarist.version,
            paymentValue: val.paymentValue || 0,
            bonus: val.bonus || 0,
            deduction: val.deduction || 0
          }));
        }
      }
    },
    { immediate: true, deep: true }
);

watch(
    () => form.value.startHour,
    (newStartHour) => {
      if (newStartHour && form.value.endHour) {
        const startToMinutes = (time) => {
          const [hours, minutes] = time.split(':').map(Number);
          return hours * 60 + minutes;
        };

        const startMinutes = startToMinutes(newStartHour);
        const endMinutes = startToMinutes(form.value.endHour);

        if (endMinutes <= startMinutes) {
          form.value.endHour = null;
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
      cpf: diarist.cpf,
      phoneNumber: diarist.phoneNumber,
      status: diarist.status,
      pixKey: diarist.pixKey,
      version: diarist.version,
      paymentValue: form.value.baseDailyRate || 0,
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
      const dailyWageDto = {
        enterprise: { id: form.value.enterprise },
        dayLaborer: selectedDiarists.value.map(diarist => ({
          id: diarist.id,
          name: diarist.name,
          cpf: diarist.cpf,
          phoneNumber: diarist.phoneNumber,
          status: diarist.status,
          pixKey: diarist.pixKey,
          version: diarist.version,
          paymentValue: diarist.paymentValue || 0,
          bonus: diarist.bonus || 0,
          deduction: diarist.deduction || 0
        })),
        workDate: formatToLocalDate(form.value.workDay),
        startHour: formatToLocalTime(form.value.startHour),
        endHour: formatToLocalTime(form.value.endHour),
        baseDailyRate: form.value.baseDailyRate,
        notes: form.value.notes,
        paymentStatus: 'NAO_PAGO'
      };
      await createDiaria(dailyWageDto);
    } else if (props.mode === "edit") {
      const updateDto = {
        baseDailyRate: form.value.baseDailyRate,
        bonus: selectedDiarists.value[0]?.bonus || 0,
        deduction: selectedDiarists.value[0]?.deduction || 0,
        paymentValue: selectedDiarists.value[0]?.paymentValue || 0,
        notes: form.value.notes,
        paymentStatus: form.value.paymentStatus
      };
      await updateDiaria(updateDto);
    }

  } catch (error) {
    console.error(error);
    showSnackbar("Erro ao processar diárias.", "error");
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
    console.error(error);
    showSnackbar("Erro ao cadastrar diárias.", "error");
    throw error;
  }
}

async function updateDiaria(updateDto) {
  const changed = hasChanges(props.modelValue, { ...form.value, ...updateDto });
  if (!changed) {
    showSnackbar("Nenhuma modificação foi feita.", "info");
    return;
  }

  try {
    await DailyWageService.update(form.value.id, updateDto);
    showSnackbar("Alterações salvas com sucesso!", "success");
    setTimeout(() => emit("submit"), 500);
  } catch (error) {
    console.error(error);
    showSnackbar("Erro ao salvar alterações.", "error");
    throw error;
  }
}

onMounted(async () => {
  await loadDiaristas();
  await loadEmpresas();
});

const loadDiaristas = async () => {
  try {
    const response = await DayLaborerService.findAll();
    diaristas.value = Array.isArray(response)
        ? response
        : response?.content || [];
  } catch (error) {
    console.error("Erro ao buscar diaristas:", error);
    diaristas.value = [];
  }
};

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

        <!-- Select de diarista só aparece no modo create -->
        <v-select
            v-if="showDiaristSelect && canSelectDiarist"
            v-model="form.dayLaborer"
            :items="availableDiaristas"
            item-title="name"
            item-value="id"
            label="Diarista"
            density="comfortable"
            variant="outlined"
            @update:modelValue="addDiarist"
            :readonly="isReadOnly"
            :disabled="isReadOnly"
        />

        <!-- Tabela de diaristas -->
        <v-card v-if="selectedDiarists.length" rounded="lg" style="margin-bottom: 10px;">
          <v-table density="comfortable" class="elevation-1">
            <thead>
            <tr>
              <th class="text-left font-weight-bold text-primary">Nome</th>
              <th class="text-left font-weight-bold text-primary">Valor a Pagar</th>
              <th class="text-left font-weight-bold text-primary">Bônus</th>
              <th class="text-left font-weight-bold text-primary">Dedução</th>
              <th v-if="showDeleteAction" class="text-center font-weight-bold text-primary">Ações</th>
            </tr>
            </thead>
            <tbody>
            <tr
                v-for="d in selectedDiarists"
                :key="d.id"
                class="transition-fast-in-fast-out"
            >
              <td class="font-weight-medium" :class="{ 'text-grey': isReadOnly }">
                {{ d.name }}
              </td>
              <td>
                <MoneyInput
                    v-model="d.paymentValue"
                    label=" "
                    :readonly="isReadOnly"
                    :disabled="isReadOnly"
                    density="compact"
                    variant="outlined"
                    class="mt-2"
                />
              </td>
              <td>
                <MoneyInput
                    v-model="d.bonus"
                    label=" "
                    :readonly="isReadOnly"
                    :disabled="isReadOnly"
                    density="compact"
                    variant="outlined"
                    class="mt-2"
                />
              </td>
              <td>
                <MoneyInput
                    v-model="d.deduction"
                    label=" "
                    :readonly="isReadOnly"
                    :disabled="isReadOnly"
                    density="compact"
                    variant="outlined"
                    class="mt-2"
                />
              </td>
              <td v-if="showDeleteAction" class="text-center">
                <v-btn
                    icon="mdi-delete"
                    color="red-lighten-1"
                    size="small"
                    variant="text"
                    @click="removeDiarist(d.id)"
                    :disabled="isReadOnly"
                />
              </td>
            </tr>
            </tbody>
          </v-table>
        </v-card>

        <v-textarea
            v-model="form.notes"
            label="Observações"
            density="comfortable"
            variant="outlined"
            :readonly="isReadOnly"
            :disabled="isReadOnly"
            class="mt-2"
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