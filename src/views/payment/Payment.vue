<script setup>
import { computed, onMounted, ref } from 'vue';
import DeleteDialog from '@/shared/DeleteDialog.vue';
import HeaderPaymentComponent from '@/views/payment/HeaderPaymentComponent.vue';
import PaymentFormComponent from '@/views/payment/PaymentFormComponent.vue';
import PaymentService from '@/api/services/payment/PaymentService.js';


const payments = ref({ content: [], totalElements: 0, totalPages: 0 });
const loading = ref(false);


const currentFilters = ref({
  dayLaborerName: null,
  enterpriseName: null,
  startDate: null,
  endDate: null,
});


const page = ref(1);
const itemsPerPage = ref(5);


const pageCount = computed(() => payments.value.totalPages || 0);


const loadPayments = async (pageIndex = 0) => {
  try {
    loading.value = true;
    // Combine pagination and filter parameters
    const params = {
      page: pageIndex,
      size: itemsPerPage.value,
      ...currentFilters.value,
    };
    // Remove null or empty values to avoid sending unnecessary query params
    Object.keys(params).forEach((key) => {
      if (params[key] === null || params[key] === '' || params[key] === undefined) {
        delete params[key];
      }
    });
    // Call the payment service
    const response = await PaymentService.findAll(params);
    payments.value = response;
  } catch (error) {
    console.error('Erro ao buscar pagamentos:', error);
    payments.value = { content: [], totalElements: 0, totalPages: 0 };
  } finally {
    loading.value = false;
  }
};

// Format a date string into "dd/MM/yyyy" for display
const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR');
};

// Format a number into Brazilian currency format
const formatCurrency = (value) => {
  if (value === null || value === undefined) return 'R$ 0,00';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

// Table headers for the payment list
const headers = [
  { title: 'Data', key: 'paymentDateFormatted', align: 'center' },
  { title: 'Diarista(s)', key: 'diaristas', align: 'center' },
  { title: 'Empresa(s)', key: 'empresas', align: 'center' },
  { title: 'Valor', key: 'valueFormatted', align: 'center' },
  { title: 'Método', key: 'method', align: 'center' },
  { title: 'Ações', key: 'acoes', align: 'center', sortable: false },
];

// Compute a formatted version of the payments for display
const paymentsFormatted = computed(() => {
  return payments.value.content.map((payment) => {
    // Derive diarist and enterprise names from the embedded daily wages
    const diarists = Array.isArray(payment.dailyWages)
      ? payment.dailyWages
          .map((dw) => dw?.dayLaborer?.name)
          .filter(Boolean)
          .join(', ')
      : '-';
    const enterprises = Array.isArray(payment.dailyWages)
      ? payment.dailyWages
          .map((dw) => dw?.enterprise?.name)
          .filter(Boolean)
          .join(', ')
      : '-';
    return {
      ...payment,
      paymentDateFormatted: formatDate(payment.date),
      valueFormatted: formatCurrency(payment.value),
      diaristas: diarists || '-',
      empresas: enterprises || '-',
    };
  });
});

// Handle page changes from the data table
const onPageChange = (newPage) => {
  loadPayments(newPage - 1);
};

// Handle change in items per page
const onItemsPerPageChange = () => {
  page.value = 1;
  loadPayments(0);
};

// Handle filter application from the header component
const applyFilters = (filters) => {
  if (filters === null) {
    currentFilters.value = {};
  } else {
    currentFilters.value = filters;
  }
  page.value = 1;
  loadPayments(0);
};

// Dialog controls for create/edit/view payment
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

// After a payment is deleted, reload the current page
const onDeleted = async () => {
  try {
    await loadPayments(page.value - 1);
    if (payments.value.content.length === 0 && page.value > 1) {
      page.value = page.value - 1;
      await loadPayments(page.value - 1);
    }
  } catch (err) {
    console.error('Erro ao recarregar pagamentos:', err);
  }
  selectedPayment.value = null;
};

const onDeleteError = (err) => {
  console.error(err);
};

// After submit in form dialog, close the dialog and refresh list
const onDialogSubmit = async () => {
  dialog.value = false;
  await loadPayments(page.value - 1);
};

// Cancel form dialog: simply close and reset selection
const onDialogCancel = () => {
  dialog.value = false;
  selectedPayment.value = null;
};

// Load initial payments on mount
onMounted(async () => {
  await loadPayments(0);
});
</script>

<template>
  <div class="w-100 h-100">
    <!-- Header component with filter controls and create button -->
    <HeaderPaymentComponent
        class="mb-4"
        @cadastrar="onCadastrar"
        @filtrar="applyFilters"
    />

    <!-- Card containing the data table -->
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
          @update:page="onPageChange"
          @update:items-per-page="onItemsPerPageChange"
      >
        <!-- Header slot for custom header titles -->
        <template #header.paymentDateFormatted="{ column }">
          <span class="font-weight-bold">{{ column.title }}</span>
        </template>
        <template #header.diaristas="{ column }">
          <span class="font-weight-bold">{{ column.title }}</span>
        </template>
        <template #header.empresas="{ column }">
          <span class="font-weight-bold">{{ column.title }}</span>
        </template>
        <template #header.valueFormatted="{ column }">
          <span class="font-weight-bold">{{ column.title }}</span>
        </template>
        <template #header.method="{ column }">
          <span class="font-weight-bold">{{ column.title }}</span>
        </template>
        <template #header.acoes="{ column }">
          <span class="font-weight-bold">{{ column.title }}</span>
        </template>

        <!-- Data slots for each column -->
        <template #item.paymentDateFormatted="{ item }">
          {{ item.paymentDateFormatted }}
        </template>
        <template #item.diaristas="{ item }">
          {{ item.diaristas }}
        </template>
        <template #item.empresas="{ item }">
          {{ item.empresas }}
        </template>
        <template #item.valueFormatted="{ item }">
          <span>{{ item.valueFormatted }}</span>
        </template>
        <template #item.method="{ item }">
          {{ item.method || '-' }}
        </template>

        <!-- Action buttons: view, edit, delete -->
        <template #item.acoes="{ item }">
          <div class="d-flex justify-center ga-2">
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
                color="error"
                prepend-icon="mdi-delete"
                @click="onDelete(item)"
            >
              Excluir
            </v-btn>
          </div>
        </template>

        <!-- Table footer with pagination and items per page control -->
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

  <!-- Dialog for create/edit/view payment -->
  <v-dialog v-model="dialog" max-width="1000px">
    <PaymentFormComponent
        :mode="dialogMode"
        :model-value="selectedPayment"
        @submit="onDialogSubmit"
        @cancel="onDialogCancel"
    />
  </v-dialog>

  <!-- Confirmation dialog for deletion -->
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