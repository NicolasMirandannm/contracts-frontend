<script setup>
import { computed, ref, watch, defineProps, defineEmits } from "vue";

const props = defineProps({
  headers: { type: Array, required: true }, // [{ key, label, width, align }]
  items:   { type: Array, required: true },

  // Coluna de ações
  showActions: { type: Boolean, default: false },
  isReadOnly:  { type: Boolean, default: false },

  // ===== Opção 1: SCROLL =====
  scroll:  { type: Boolean, default: true }, // << por padrão usa scroll
  height:  { type: Number,  default: 220 },  // altura máx. da área rolável

  // ===== Opção 2: PAGINAÇÃO =====
  paginated: { type: Boolean, default: false },
  pageSize:  { type: Number,  default: 6 },      // itens por página
  pageSizes: { type: Array,   default: () => [4, 6, 10, 20] },
});

const emit = defineEmits(["action"]);

// estado de paginação interna
const page = ref(1);
const size = ref(props.pageSize);
watch(
    () => props.pageSize,
    v => { size.value = v; page.value = 1; }
);

// itens visíveis (pagina ou tudo)
const totalPages = computed(() =>
    props.paginated ? Math.max(1, Math.ceil(props.items.length / size.value)) : 1
);

watch(() => props.items, () => { if (page.value > totalPages.value) page.value = 1; });

const visibleItems = computed(() => {
  if (!props.paginated) return props.items;
  const start = (page.value - 1) * size.value;
  return props.items.slice(start, start + size.value);
});
</script>

<template>
  <v-card
      rounded="lg"
      class="elevation-2 mb-4"
      style="overflow: visible"
  >
  <!-- CONTAINER DA TABELA -->
  <div
      class="table-container"
      :style="scroll && !paginated ? { maxHeight: `${height}px`, overflowY: 'auto' } : {}"
  >
    <!-- Cabeçalho -->
    <div class="table-header">
      <div
          v-for="header in headers"
          :key="header.key"
          class="header-cell"
          :style="{ width: header.width || 'auto', textAlign: header.align || 'center' }"
      >
        {{ header.label }}
      </div>

      <div
          v-if="showActions"
          class="header-cell text-center"
          style="width: 15%"
      >
        <slot name="header-actions"></slot>
      </div>
    </div>

    <!-- Corpo -->
    <div class="table-body">
      <div
          v-for="(item, i) in visibleItems"
          :key="item.id ?? i"
          class="table-row hover:bg-grey-lighten-5"
      >
        <div
            v-for="header in headers"
            :key="header.key"
            class="body-cell"
            :style="{ width: header.width || 'auto', textAlign: header.align || 'center' }"
        >
          <slot :name="`cell-${header.key}`" :item="item" :value="item[header.key]">
            {{ item[header.key] ?? '-' }}
          </slot>
        </div>

        <div
            v-if="showActions"
            class="body-cell text-center actions-cell"
            style="width: 15%"
        >
          <slot name="actions" :item="item" />
        </div>
      </div>
    </div>
  </div>

  <!-- Rodapé de paginação (só quando paginated=true) -->
  <div v-if="paginated" class="table-footer">
    <div class="footer-left">
      <v-select
          :items="pageSizes"
          v-model="size"
          density="compact"
          variant="outlined"
          style="max-width: 120px"
          :menu-props="{ maxHeight: 300 }"
          hide-details
          label="Linhas"
      />
      <div class="footer-info">
        {{ (page - 1) * size + 1 }}–
        {{ Math.min(page * size, items.length) }} de {{ items.length }}
      </div>
    </div>

    <v-pagination
        v-model="page"
        :length="totalPages"
        density="comfortable"
        rounded="circle"
        total-visible="5"
    />
  </div>
  </v-card>
</template>

<style scoped>
.table-container {
  display: flex;
  flex-direction: column;
  border-radius: 12px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
  background-color: rgb(var(--v-theme-surface));
}

/* Cabeçalho fixo */
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
}

.table-body {
  display: flex;
  flex-direction: column;
  min-height: 0; /* evita empurrar o container e perder o scroll */
}

/* ====== Altura reduzida e centralização ====== */
.table-row {
  display: flex;
  align-items: center; /* centraliza verticalmente o conteúdo */
  border-bottom: 1px solid var(--v-border-color);
  transition: background-color 0.2s;
  height: 50px; /* 🔹 altura fixa da linha */
  min-height: 44px;
}

.table-row:hover {
  background-color: rgba(0, 0, 0, 0.03);
}

.body-cell {
  flex: 1;
  justify-content: center;
  align-items: center;
  display: flex;
  padding: 4px 8px;
  height: 100%; /* garante alinhamento completo */
}

/* Alinhamento à esquerda na célula de nome */
.body-cell-nome {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding-left: 16px;
  height: 100%;
}

.actions-cell {
  justify-content: center;
  align-items: center;
  display: flex;
}

/* Scroll bonito quando scroll=true */
.table-container::-webkit-scrollbar {
  width: 8px;
}

.table-container::-webkit-scrollbar-thumb {
  background-color: rgba(108, 108, 108, 0.35);
  border-radius: 10px;
}

.table-container::-webkit-scrollbar-thumb:hover {
  background-color: rgba(108, 108, 108, 0.6);
}

/* Rodapé de paginação */
.table-footer {
  border-top: 1px solid var(--v-border-color);
  padding: 8px 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.footer-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.footer-info {
  font-size: 0.85rem;
  color: rgba(var(--v-theme-on-surface), 0.7);
}
</style>
