<script setup>
import { computed, onMounted, ref } from "vue";
import DeleteDialog from "@/shared/DeleteDialog.vue";
import HeaderDailyWageComponent from "@/views/daily-wage/HeaderDailyWageComponent.vue";
import DailyWageFormComponent from "@/views/daily-wage/DailyWageFormComponent.vue";
import DailyWageService from "@/api/services/daily-wage/DailyWageService.js";

const diarias = ref({ content: [], totalElements: 0, totalPages: 0 });
const carregando = ref(false);

const filtrosAtuais = ref({
  dayLaborerName: null,
  enterpriseName: null,
  workDate: null,
  status: null
});

const loadDiarias = async (page = 0) => {
  try {
    carregando.value = true;

    const params = {
      page: page,
      size: itemsPerPage.value,
      ...filtrosAtuais.value
    };

    Object.keys(params).forEach(key => {
      if (params[key] === null || params[key] === '') {
        delete params[key];
      }
    });

    const response = await DailyWageService.findAll(params);
    diarias.value = response;

  } catch (error) {
    console.error('Erro ao buscar diarias:', error);
    diarias.value = { content: [], totalElements: 0, totalPages: 0 };
  } finally {
    carregando.value = false;
  }
};

const aplicarFiltros = (novosFiltros) => {
  if (novosFiltros === null) {
    filtrosAtuais.value = {};
  } else {
    filtrosAtuais.value = novosFiltros;
  }
  page.value = 1;
  loadDiarias(0);
};

onMounted(async () => {
  await loadDiarias(0);
});

const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString + 'T00:00:00');
  return date.toLocaleDateString('pt-BR');
};

const formatTimeRange = (startHour, endHour) => {
  if (!startHour || !endHour) return '-';
  const formatTime = (timeString) => {
    return timeString.substring(0, 5);
  };
  return `${formatTime(startHour)} - ${formatTime(endHour)}`;
};

const formatCurrency = (value) => {
  if (value === null || value === undefined) return 'R$ 0,00';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

const getDiaristaName = (dayLaborer) => {
  return dayLaborer.name;
};

const headers = [
  { title: 'Empresa',        key: 'enterprise.name',           align: 'center' },
  { title: 'Diarista',       key: 'dayLaborer.name',                  align: 'center' },
  { title: 'Dia',            key: 'workDateFormatted',         align: 'center' },
  { title: 'Hora',           key: 'horaFormatada',             align: 'center' },
  { title: 'Valor',          key: 'valorFormatado',            align: 'center' },
  { title: 'Status',         key: 'paymentStatus',             align: 'center' },
  { title: 'Ações',          key: 'acoes',                     align: 'center', sortable: false },
]

const page = ref(1);
const itemsPerPage = ref(5);

const pageCount = computed(() => diarias.value.totalPages || 0);

const diariasFormatadas = computed(() => {
  return diarias.value.content.map(diaria => ({
    ...diaria,
    diarista: getDiaristaName(diaria.dayLaborer),
    workDateFormatted: formatDate(diaria.workDate),
    horaFormatada: formatTimeRange(diaria.startHour, diaria.endHour),
    valorFormatado: formatCurrency(diaria.dayLaborerPaymentValue)
  }));
});

const onPageChange = (newPage) => {
  loadDiarias(newPage - 1);
};

const onItemsPerPageChange = () => {
  page.value = 1;
  loadDiarias(0);
};

const dialog = ref(false);
const dialogMode = ref("create");
const selectedDiaria = ref(null);
const deleteDialog = ref(false);

function onCadastrar() {
  dialogMode.value = "create";
  selectedDiaria.value = {};
  dialog.value = true;
}

function onEditar(item) {
  dialogMode.value = "edit";
  selectedDiaria.value = { ...item };
  dialog.value = true;
}

function onDelete(item) {
  selectedDiaria.value = { ...item };
  deleteDialog.value = true;
}

function onVerMais(item) {
  dialogMode.value = "view";
  selectedDiaria.value = { ...item };
  dialog.value = true;
}

const onDeleted = async (id) => {
  try {
    await loadDiarias(page.value - 1);

    if (diarias.value.content.length === 0 && page.value > 1) {
      page.value = page.value - 1;
      await loadDiarias(page.value - 1);
    }
  } catch (error) {
    console.error('Erro ao recarregar diarias:', error);
  }
  selectedDiaria.value = null;
}

const onDeleteError = (err) => {
  console.error(err);
}

const onDialogSubmit = async () => {
  dialog.value = false;
  await loadDiarias(page.value - 1);
}

const onDialogCancel = () => {
  dialog.value = false;
  selectedDiaria.value = null;
}
</script>

<template>
  <div class="w-100 h-100">
    <HeaderDailyWageComponent
        class="mb-4"
        @cadastrar="onCadastrar"
        @filtrar="aplicarFiltros"
    />

    <v-card elevation="1" class="d-flex flex-column flex-grow-1 w-100 shadow-sm" rounded="xl">
      <v-data-table
          :headers="headers"
          :items="diariasFormatadas"
          :loading="carregando"
          :items-length="diarias.totalElements"
          :page="page"
          :items-per-page="itemsPerPage"
          @update:page="onPageChange"
          @update:items-per-page="onItemsPerPageChange"
      >
        <template #header.enterprise.name="{ column }"><span class="font-weight-bold">{{ column.title }}</span></template>
        <template #header.dayLaborer.name="{ column }"><span class="font-weight-bold">{{ column.title }}</span></template>
        <template #header.workDateFormatted="{ column }"><span class="font-weight-bold">{{ column.title }}</span></template>
        <template #header.horaFormatada="{ column }"><span class="font-weight-bold">{{ column.title }}</span></template>
        <template #header.valorFormatado="{ column }"><span class="font-weight-bold">{{ column.title }}</span></template>
        <template #header.paymentStatus="{ column }"><span class="font-weight-bold">{{ column.title }}</span></template>
        <template #header.acoes="{ column }"><span class="font-weight-bold">{{ column.title }}</span></template>

        <template #item.enterprise.name="{ item }">
          {{ item.enterprise?.name || '-' }}
        </template>

        <template #item.dayLaborer.name="{ item }">
          {{ item.dayLaborer?.name }}
        </template>

        <template #item.workDateFormatted="{ item }">
          {{ item.workDateFormatted }}
        </template>

        <template #item.horaFormatada="{ item }">
          {{ item.horaFormatada }}
        </template>

        <template #item.valorFormatado="{ item }">
          <span>{{ item.valorFormatado }}</span>
        </template>

        <template #item.paymentStatus="{ item }">
          <v-chip :color="item.paymentStatus === 'PAGO' ? 'success' : 'error'" variant="tonal" size="small">
            {{ item.paymentStatus === 'PAGO' ? 'Paga' : 'Não Paga' }}
          </v-chip>
        </template>

        <template #item.acoes="{ item }">
          <div class="d-flex justify-center ga-2">
            <v-btn size="small" variant="text" color="primary" prepend-icon="mdi-eye" @click="onVerMais(item)">Ver Mais</v-btn>
            <v-btn size="small" variant="text" color="info" prepend-icon="mdi-pencil" @click="onEditar(item)">Editar</v-btn>
            <v-btn size="small" variant="text" color="error" prepend-icon="mdi-delete" @click="onDelete(item)">Excluir</v-btn>
          </div>
        </template>

        <template #bottom>
          <div class="d-flex justify-space-between align-center px-4 py-2 w-100">
            <div>
              {{ (page - 1) * itemsPerPage + 1 }} -
              {{ Math.min(page * itemsPerPage, diarias.totalElements) }}
              de {{ diarias.totalElements }} itens
            </div>
            <v-pagination
                v-model="page"
                :length="pageCount"
                :total-visible="7"
                rounded="circle"
                @update:model-value="onPageChange"
            />
            <v-select
                v-model="itemsPerPage"
                :items="[5, 10, 15]"
                density="comfortable"
                hide-details
                style="max-width: 180px"
                label="Itens por página"
                @update:model-value="onItemsPerPageChange"
            />
          </div>
        </template>
      </v-data-table>
    </v-card>
  </div>

  <v-dialog v-model="dialog" max-width="1000px">
    <DailyWageFormComponent
        :mode="dialogMode"
        :model-value="selectedDiaria"
        @submit="onDialogSubmit"
        @cancel="onDialogCancel"
    />
  </v-dialog>

  <DeleteDialog
      v-model="deleteDialog"
      :item="selectedDiaria"
      :delete-service="DailyWageService.delete.bind(DailyWageService)"
      success-message="Diária excluída com sucesso!"
      error-message="Erro ao excluir diária. Tente novamente."
      @deleted="onDeleted"
      @delete-error="onDeleteError"
  />
</template>