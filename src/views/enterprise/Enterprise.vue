<script setup>
import HeaderEnterpriseComponent from "@/views/enterprise/HeaderEnterpriseComponent.vue";
import { computed, onMounted, ref } from "vue";
import EnterpriseFormComponent from "@/views/enterprise/EnterpriseFormComponent.vue";
import EnterpriseService from "@/api/services/enterprise/EnterpriseService.js";
import DeleteDialog from "@/shared/DeleteDialog.vue";

const empresas = ref([]);

onMounted(async () => {
  try {
    const response = await EnterpriseService.findAll()
    empresas.value = Array.isArray(response)
        ? response
        : response?.content || []
  } catch (error) {
    console.error('Erro ao buscar empresas:', error)
    empresas.value = []
  }
})


const headers = [
  { title: 'Empresa',        key: 'name',           align: 'center' },
  { title: 'CNPJ',           key: 'cnpj',           align: 'center' },
  { title: 'Representante',  key: 'ownerName',      align: 'center' },
  { title: 'Status',         key: 'status',         align: 'center' },
  { title: 'Ações',          key: 'acoes',          align: 'center', sortable: false },
]

const page = ref(1)
const itemsPerPage = ref(5)

// total de páginas
const pageCount = computed(() => Math.ceil(empresas.value.length / itemsPerPage.value))

// itens que realmente serão exibidos na página atual
const paginatedItems = computed(() => {
  const start = (page.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return empresas.value.slice(start, end)
})


const dialog = ref(false);
const dialogMode = ref("create"); // create | edit | view
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

const onDeleted = (id) => {
  if (empresas.value && Array.isArray(empresas.value)) {
    empresas.value = empresas.value.filter(e => e.id !== id);
  } else {
    console.warn('empresas.value está indefinido');
  }
  selectedEmpresa.value = null;
}

const onDeleteError = (err) => {
  console.error(err);
}
</script>

<template>
  <div class="w-100 h-100">
    <HeaderEnterpriseComponent class="mb-4" @cadastrar="onCadastrar" />
    <v-card elevation="1" class="d-flex flex-column flex-grow-1 w-100 shadow-sm" rounded="xl">
      <v-data-table
          :headers="headers"
          :items="paginatedItems"
      >
        <template #header.name="{ column }"><span class="font-weight-bold">{{ column.title }}</span></template>
        <template #header.cnpj="{ column }"><span class="font-weight-bold">{{ column.title }}</span></template>
        <template #header.ownerName="{ column }"><span class="font-weight-bold">{{ column.title }}</span></template>
        <template #header.status="{ column }"><span class="font-weight-bold">{{ column.title }}</span></template>
        <template #header.acoes="{ column }"><span class="font-weight-bold">{{ column.title }}</span></template>

        <template #item.status="{ item }">
          <v-chip :color="item.status === 'Ativo' ? 'success' : 'error'" variant="tonal" size="small">
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
            <div>{{ (page - 1) * itemsPerPage + 1 }} -
              {{ Math.min(page * itemsPerPage, empresas.length) }}
              de {{ empresas.length }} itens
            </div>
            <v-pagination
                v-model="page"
                :length="pageCount"
                total-visible="7"
                rounded="circle"
            />
            <v-select
                v-model="itemsPerPage"
                :items="[5, 10, 15]"
                density="comfortable"
                hide-details
                style="max-width: 180px"
                label="Itens por página"
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
        @submit="dialog = false"
        @cancel="dialog = false"
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
