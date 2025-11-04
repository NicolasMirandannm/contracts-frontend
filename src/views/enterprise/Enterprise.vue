<script setup>
import HeaderEnterpriseComponent from "@/views/enterprise/HeaderEnterpriseComponent.vue";
import {computed, onMounted, ref, watch} from "vue";
import EnterpriseFormComponent from "@/views/enterprise/EnterpriseFormComponent.vue";
import EnterpriseService from "@/api/services/enterprise/EnterpriseService.js";
import DeleteDialog from "@/shared/DeleteDialog.vue";

const empresas = ref({ content: [], totalElements: 0, totalPages: 0 });
const carregando = ref(false);

const page = ref(1);
const itemsPerPage = ref(5);

watch(page, (newPage) => {
  loadEmpresas(newPage - 1);
});

const filtrosAtuais = ref({
  name: null,
  cnpj: null,
  ownerName: null,
  status: null
});

function formatCNPJ(value) {
  if (!value) return '';
  const numbers = value.replace(/\D/g, '');

  if (numbers.length <= 2) return numbers;
  if (numbers.length <= 5) return `${numbers.slice(0, 2)}.${numbers.slice(2)}`;
  if (numbers.length <= 8) return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5)}`;
  if (numbers.length <= 12)
    return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5, 8)}/${numbers.slice(8)}`;
  return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5, 8)}/${numbers.slice(8, 12)}-${numbers.slice(12, 14)}`;
}

const loadEmpresas = async (page = 0) => {
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

    empresas.value = await EnterpriseService.findAll(params);
  } catch (error) {
    console.error('Erro ao buscar empresas:', error)
    empresas.value = { content: [], totalElements: 0, totalPages: 0 };
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
  loadEmpresas(0);
};

onMounted(async () => {
  await loadEmpresas(0);
})

const headers = [
  { title: 'Empresa', key: 'name', align: 'center' },
  { title: 'CNPJ', key: 'cnpj', align: 'center' },
  { title: 'Representante', key: 'ownerName', align: 'center' },
  { title: 'Status', key: 'status', align: 'center' },
  { title: 'Ações', key: 'acoes', align: 'center', sortable: false },
]

const pageCount = computed(() => empresas.value.totalPages || 0);

const onPageChange = (newPage) => {
  loadEmpresas(newPage - 1);
};

const onItemsPerPageChange = () => {
  page.value = 1;
  loadEmpresas(0);
};

const dialog = ref(false);
const dialogMode = ref("create");
const selectedEmpresa = ref(null);
const deleteDialog = ref(false);

function onCadastrar() {
  dialogMode.value = "create";
  selectedEmpresa.value = {};
  dialog.value = true;
}

function onEditar(item) {
  dialogMode.value = "edit";
  selectedEmpresa.value = { ...item };
  dialog.value = true;
}

function onDelete(item) {
  selectedEmpresa.value = { ...item };
  deleteDialog.value = true;
}

function onVerMais(item) {
  dialogMode.value = "view";
  selectedEmpresa.value = { ...item };
  dialog.value = true;
}

const onDeleted = async (id) => {
  try {
    await loadEmpresas(page.value - 1);

    if (empresas.value.content.length === 0 && page.value > 1) {
      page.value = page.value - 1;
      await loadEmpresas(page.value - 1);
    }
  } catch (error) {
    console.error('Erro ao recarregar empresas:', error);
  }
  selectedEmpresa.value = null;
}

const onDeleteError = (err) => {
  console.error(err);
}

const onDialogSubmit = async () => {
  dialog.value = false;
  await loadEmpresas(page.value - 1);
}

const onDialogCancel = () => {
  dialog.value = false;
}
</script>

<template>
  <div class="w-100 h-100">
    <HeaderEnterpriseComponent
        class="mb-4"
        @cadastrar="onCadastrar"
        @filtrar="aplicarFiltros"
    />

    <v-card elevation="1" class="d-flex flex-column flex-grow-1 w-100 shadow-sm" rounded="xl">
      <v-data-table
          :headers="headers"
          :items="empresas.content"
          :loading="carregando"
          :items-length="empresas.totalElements"
          :page="page"
          :items-per-page="itemsPerPage"
          @update:items-per-page="onItemsPerPageChange"
      >
        <template #header.name="{ column }">
          <span class="font-weight-bold">{{ column.title }}</span>
        </template>

        <template #header.cnpj="{ column }">
          <span class="font-weight-bold">{{ column.title }}</span>
        </template>

        <template #header.ownerName="{ column }">
          <span class="font-weight-bold">{{ column.title }}</span>
        </template>

        <template #header.status="{ column }">
          <span class="font-weight-bold">{{ column.title }}</span>
        </template>

        <template #header.acoes="{ column }">
          <span class="font-weight-bold">{{ column.title }}</span>
        </template>

        <template #item.name="{ item }">
          <span>{{ item.name }}</span>
        </template>

        <template #item.cnpj="{ item }">
          <span>{{ formatCNPJ(item.cnpj) }}</span>
        </template>

        <template #item.ownerName="{ item }">
          <span>{{ item.ownerName }}</span>
        </template>

        <template #item.status="{ item }">
          <v-chip :color="item.status === 'ATIVO' ? 'success' : 'error'" variant="tonal" size="small">
            {{ item.status }}
          </v-chip>
        </template>

        <template #item.acoes="{ item }">
          <div class="d-flex justify-center ga-2">
            <v-btn size="small" variant="text" color="primary" prepend-icon="mdi-eye" @click="onVerMais(item)">
              Ver Mais
            </v-btn>
            <v-btn size="small" variant="text" color="info" prepend-icon="mdi-pencil" @click="onEditar(item)">
              Editar
            </v-btn>
            <v-btn size="small" variant="text" color="error" prepend-icon="mdi-delete" @click="onDelete(item)">
              Excluir
            </v-btn>
          </div>
        </template>

        <template #bottom>
          <div class="d-flex justify-space-between align-center px-4 py-2 w-100">
            <div>
              {{ (page - 1) * itemsPerPage + 1 }} -
              {{ Math.min(page * itemsPerPage, empresas.totalElements) }}
              de {{ empresas.totalElements }} itens
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
    <EnterpriseFormComponent
        :mode="dialogMode"
        :model-value="selectedEmpresa"
        @submit="onDialogSubmit"
        @cancel="onDialogCancel"
    />
  </v-dialog>

  <DeleteDialog
      v-model="deleteDialog"
      :item="selectedEmpresa"
      :delete-service="EnterpriseService.delete.bind(EnterpriseService)"
      success-message="Empresa excluída com sucesso!"
      error-message="Erro ao excluir empresa. Tente novamente."
      @deleted="onDeleted"
      @delete-error="onDeleteError"
  />
</template>
