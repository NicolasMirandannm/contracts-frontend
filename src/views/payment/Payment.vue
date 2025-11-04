<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import DeleteDialog from '@/shared/DeleteDialog.vue';
import HeaderPaymentComponent from '@/views/payment/HeaderPaymentComponent.vue';
import PaymentFormComponent from '@/views/payment/PaymentFormComponent.vue';
import PaymentService from '@/api/services/payment/PaymentService.js';

const payments = ref({ content: [], totalElements: 0, totalPages: 0 });
const loading = ref(false);
const emits = defineEmits(['reloadDailyWages']);

const page = ref(1);
const itemsPerPage = ref(5);

watch(page, (newPage) => {
  loadPayments(newPage - 1);
});

const today = new Date();
const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    .toISOString()
    .substring(0, 10);
const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)
    .toISOString()
    .substring(0, 10);

const currentFilters = ref({
  paymentId: '',
  startDate: startOfMonth,
  endDate: endOfMonth,
});

const pageCount = computed(() => payments.value.totalPages || 0);

const loadPayments = async (pageIndex = 0) => {
  try {
    loading.value = true;

    const params = {
      page: pageIndex,
      size: itemsPerPage.value,
      ...currentFilters.value,
    };

    Object.keys(params).forEach((key) => {
      if (
          params[key] === null ||
          params[key] === '' ||
          params[key] === undefined
      ) {
        delete params[key];
      }
    });

    payments.value = await PaymentService.findAll(params);
  } catch (error) {
    console.error('Erro ao buscar pagamentos:', error);
    payments.value = { content: [], totalElements: 0, totalPages: 0 };
  } finally {
    loading.value = false;
  }
};

const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR');
};

const formatCurrency = (value) => {
  if (value === null || value === undefined) return 'R$ 0,00';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

// headers com a nova coluna "Diárias Pagas"
const headers = [
  { title: 'Data', key: 'paymentDateFormatted', align: 'center' },
  { title: 'Diarista', key: 'dayLaborer', align: 'center' },
  { title: 'Valor', key: 'valueFormatted', align: 'center' },
  { title: 'Diárias Pagas', key: 'dailyWagesCount', align: 'center' },
  { title: 'Método', key: 'method', align: 'center' },
  { title: 'Ações', key: 'acoes', align: 'center', sortable: false },
];

// inclui dailyWagesCount usando o length do dailyWages
const paymentsFormatted = computed(() => {
  return payments.value.content.map((payment) => {
    return {
      ...payment,
      paymentDateFormatted: formatDate(payment.date),
      valueFormatted: formatCurrency(payment.value),
      dayLaborer: payment.dayLaborer,
      version: payment.version,
      dailyWagesCount: payment.dailyWages ? payment.dailyWages.length : 0,
    };
  });
});

const onPageChange = (newPage) => {
  loadPayments(newPage - 1);
};

const onItemsPerPageChange = () => {
  page.value = 1;
  loadPayments(0);
};

const applyFilters = (filters) => {
  if (filters === null) {
    currentFilters.value = {};
  } else {
    currentFilters.value = filters;
  }
  page.value = 1;
  loadPayments(0);
};

const dialog = ref(false);
const dialogMode = ref('create');
const selectedPayment = ref(null);
const deleteDialog = ref(false);

function onCadastrar() {
  dialogMode.value = 'create';
  selectedPayment.value = {};
  dialog.value = true;
}

function onEditar(item) {
  dialogMode.value = 'edit';
  selectedPayment.value = { ...item };
  dialog.value = true;
}

function onView(item) {
  dialogMode.value = 'view';
  selectedPayment.value = { ...item };
  dialog.value = true;
}

function onDelete(item) {
  selectedPayment.value = { ...item };
  deleteDialog.value = true;
}

const onDeleted = async () => {
  try {
    await loadPayments(page.value - 1);
    if (payments.value.content.length === 0 && page.value > 1) {
      page.value = page.value - 1;
      await loadPayments(page.value - 1);
    }
    emits("reloadDailyWages");
  } catch (err) {
    console.error('Erro ao recarregar pagamentos:', err);
  }
  selectedPayment.value = null;
};

const emitirDemonstrativo = async (item) => {
  try {
    const paymentId = item.id;
    const response = await PaymentService.downloadStatementPdf(paymentId);

    const blob = new Blob([response.data], { type: 'application/pdf' });

    const contentDisposition = response.headers['content-disposition'];
    let filename = 'arquivo.pdf';
    if (contentDisposition) {
      const match = contentDisposition.match(/filename="(.+)"/);
      if (match && match[1]) filename = match[1];
    }

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();

    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Erro ao emitir demonstrativo:', error);
  }
};

const onDeleteError = (err) => {
  console.error(err);
};

const onDialogSubmit = async () => {
  dialog.value = false;
  await loadPayments(page.value - 1);
  emits("reloadDailyWages")
};

const onDialogCancel = () => {
  dialog.value = false;
  selectedPayment.value = null;
};

onMounted(async () => {
  await loadPayments(0);
});
</script>

<template>
  <div class="w-100 h-100">
    <HeaderPaymentComponent
        class="mb-4"
        @cadastrar="onCadastrar"
        @filtrar="applyFilters"
    />

    <v-card
        elevation="1"
        class="d-flex flex-column flex-grow-1 w-100 shadow-sm"
        rounded="xl"
    >
      <v-data-table
          :headers="headers"
          :items="paymentsFormatted"
          :loading="loading"
          :items-length="payments.totalElements"
          :page="page"
          :items-per-page="itemsPerPage"
          @update:items-per-page="onItemsPerPageChange"
      >
        <!-- headers -->
        <template #header.paymentDateFormatted="{ column }">
          <span class="font-weight-bold">{{ column.title }}</span>
        </template>
        <template #header.dayLaborer="{ column }">
          <span class="font-weight-bold">{{ column.title }}</span>
        </template>
        <template #header.valueFormatted="{ column }">
          <span class="font-weight-bold">{{ column.title }}</span>
        </template>
        <template #header.dailyWagesCount="{ column }">
          <span class="font-weight-bold">{{ column.title }}</span>
        </template>
        <template #header.method="{ column }">
          <span class="font-weight-bold">{{ column.title }}</span>
        </template>
        <template #header.acoes="{ column }">
          <span class="font-weight-bold">{{ column.title }}</span>
        </template>

        <!-- linhas -->
        <template #item.paymentDateFormatted="{ item }">
          {{ item.paymentDateFormatted }}
        </template>

        <template #item.dayLaborer="{ item }">
          {{ item.dayLaborer?.name || '-' }}
        </template>

        <template #item.valueFormatted="{ item }">
          <span>{{ item.valueFormatted }}</span>
        </template>

        <template #item.dailyWagesCount="{ item }">
          {{ item.dailyWagesCount }}
        </template>

        <template #item.method="{ item }">
          {{ item.method || '-' }}
        </template>

        <template #item.acoes="{ item }">
          <v-btn
              size="small"
              variant="text"
              color="primary"
              prepend-icon="mdi-eye"
              @click="onView(item)"
          >
            Ver Mais
          </v-btn>

          <v-btn
              size="small"
              variant="text"
              color="info"
              prepend-icon="mdi-pencil"
              @click="onEditar(item)"
          >
            Editar
          </v-btn>

          <v-btn
              size="small"
              variant="text"
              color="secondary"
              prepend-icon="mdi-file-pdf-box"
              @click="emitirDemonstrativo(item)"
          >
            Emitir demonstrativo
          </v-btn>

          <v-btn
              size="small"
              variant="text"
              color="error"
              prepend-icon="mdi-delete"
              @click="onDelete(item)"
          >
            Excluir
          </v-btn>
        </template>

        <!-- footer -->
        <template #bottom>
          <div class="d-flex justify-space-between align-center px-4 py-2 w-100">
            <div>
              {{ (page - 1) * itemsPerPage + 1 }} -
              {{ Math.min(page * itemsPerPage, payments.totalElements) }}
              de {{ payments.totalElements }} itens
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
    <PaymentFormComponent
        :mode="dialogMode"
        :model-value="selectedPayment"
        @submit="onDialogSubmit"
        @cancel="onDialogCancel"
    />
  </v-dialog>

  <DeleteDialog
      v-model="deleteDialog"
      :item="selectedPayment"
      :delete-service="PaymentService.delete.bind(PaymentService)"
      success-message="Pagamento excluído com sucesso!"
      error-message="Erro ao excluir pagamento. Tente novamente."
      @deleted="onDeleted"
      @delete-error="onDeleteError"
  />
</template>
