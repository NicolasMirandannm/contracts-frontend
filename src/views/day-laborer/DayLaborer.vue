<script setup>
import {computed, onMounted, ref, watch} from "vue";
import DeleteDialog from "@/shared/DeleteDialog.vue";
import HeaderDayLaborerComponent from "@/views/day-laborer/HeaderDayLaborerComponent.vue";
import DayLaborerFormComponent from "@/views/day-laborer/DayLaborerFormComponent.vue";
import DayLaborerService from "@/api/services/day-laborer/DayLaborerService.js";

const diaristas = ref({ content: [], totalElements: 0, totalPages: 0 });
const carregando = ref(false);

const page = ref(1);
const itemsPerPage = ref(5);

watch(page, (newPage) => {
  loadDiaristas(newPage - 1);
});

const filtrosAtuais = ref({
  name: '',
  cpf: '',
  phoneNumber: '',
  status: ''
});

const formatCPF = (cpf) => {
  if (!cpf) return '';
  const numbers = cpf.replace(/\D/g, '');
  if (numbers.length <= 3) return numbers;
  if (numbers.length <= 6) return `${numbers.slice(0, 3)}.${numbers.slice(3)}`;
  if (numbers.length <= 9) return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`;
  return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9, 11)}`;
};

const formatPhone = (phone) => {
  if (!phone) return '';
  const numbers = phone.replace(/\D/g, '');
  if (numbers.length <= 2) return numbers;
  if (numbers.length <= 6) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
  if (numbers.length <= 10) return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`;
  return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
};

const loadDiaristas = async (page = 0) => {
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
    diaristas.value = await DayLaborerService.findAll(params);
  } catch (error) {
    console.error('Erro ao buscar diaristas:', error)
    diaristas.value = []
    console.error('Erro ao buscar diarias:', error);
    diaristas.value = { content: [], totalElements: 0, totalPages: 0 };
  } finally {
    carregando.value = false;
  }
}

const aplicarFiltros = (novosFiltros) => {
  if (novosFiltros === null) {
    filtrosAtuais.value = {};
  } else {
    filtrosAtuais.value = novosFiltros;
  }
  page.value = 1;
  loadDiaristas(0);
};

onMounted(async () => {
  await loadDiaristas(0);
})

const headers = [
  { title: 'Nome',           key: 'name',           align: 'center' },
  { title: 'CPF',            key: 'cpf',            align: 'center' },
  { title: 'Contato',        key: 'phoneNumber',    align: 'center' },
  { title: 'Status',         key: 'status',         align: 'center' },
  { title: 'Ações',          key: 'acoes',          align: 'center', sortable: false },
]

const pageCount = computed(() => diaristas.value.totalPages || 0);

const onPageChange = (newPage) => {
  loadDiaristas(newPage - 1);
};

const onItemsPerPageChange = () => {
  page.value = 1;
  loadDiaristas(0);
};

const dialog = ref(false);
const dialogMode = ref("create");
const selectedDiarista = ref(null);
const deleteDialog = ref(false);

function onCadastrar() {
  dialogMode.value = "create";
  selectedDiarista.value = {};
  dialog.value = true;
}

function onEditar(item) {
  dialogMode.value = "edit";
  selectedDiarista.value = { ...item };
  dialog.value = true;
}

function onDelete(item) {
  selectedDiarista.value = { ...item };
  deleteDialog.value = true;
}

function onVerMais(item) {
  dialogMode.value = "view";
  selectedDiarista.value = { ...item };
  dialog.value = true;
}

const onDeleted = async (id) => {
  try {
    await loadDiaristas(page.value - 1);

    if (diaristas.value.content.length === 0 && page.value > 1) {
      page.value = page.value - 1;
      await loadDiaristas(page.value - 1);
    }
  } catch (error) {
    console.error('Erro ao recarregar diaristas:', error);
  }
  selectedDiarista.value = null;
}

const onDeleteError = (err) => {
  console.error(err);
}

const onDialogSubmit = async () => {
  dialog.value = false;
  await loadDiaristas(page.value - 1);
}

const onDialogCancel = () => {
  dialog.value = false;
}
</script>

<template>
  <div class="w-100 h-100">
    <HeaderDayLaborerComponent
        class="mb-4"
        @cadastrar="onCadastrar"
        @filtrar="aplicarFiltros"
    />
    <v-card elevation="1" class="d-flex flex-column flex-grow-1 w-100 shadow-sm" rounded="xl">
      <v-data-table
          :headers="headers"
          :items="diaristas.content"
          :loading="carregando"
          :items-length="diaristas.totalElements"
          :page="page"
          :items-per-page="itemsPerPage"
          @update:items-per-page="onItemsPerPageChange"
      >
        <template #header.name="{ column }"><span class="font-weight-bold">{{ column.title }}</span></template>
        <template #header.cpf="{ column }"><span class="font-weight-bold">{{ column.title }}</span></template>
        <template #header.phoneNumber="{ column }"><span class="font-weight-bold">{{ column.title }}</span></template>
        <template #header.status="{ column }"><span class="font-weight-bold">{{ column.title }}</span></template>
        <template #header.acoes="{ column }"><span class="font-weight-bold">{{ column.title }}</span></template>

        <template #item.name="{ item }">
          <span>{{ item.name }}</span>
        </template>

        <template #item.cpf="{ item }">
          <span>{{ formatCPF(item.cpf) }}</span>
        </template>

        <template #item.phoneNumber="{ item }">
          <span>{{ formatPhone(item.phoneNumber) }}</span>
        </template>

        <template #item.status="{ item }">
          <v-chip :color="item.status === 'ATIVO' ? 'success' : 'error'" variant="tonal" size="small">
            {{ item.status }}
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
              {{ Math.min(page * itemsPerPage, diaristas.totalElements) }}
              de {{ diaristas.totalElements }} itens
            </div>
            <v-pagination
                v-model="page"
                :length="pageCount"
                :total-visible="7"
                rounded="circle"
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
    <DayLaborerFormComponent
        :mode="dialogMode"
        :model-value="selectedDiarista"
        @submit="onDialogSubmit"
        @cancel="onDialogCancel"
    />
  </v-dialog>

  <DeleteDialog
      v-model="deleteDialog"
      :item="selectedDiarista"
      :delete-service="DayLaborerService.delete.bind(DayLaborerService)"
      success-message="Diarista excluído com sucesso!"
      error-message="Erro ao excluir diarista. Tente novamente."
      @deleted="onDeleted"
      @delete-error="onDeleteError"
  />
</template>
