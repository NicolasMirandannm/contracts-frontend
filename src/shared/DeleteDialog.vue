<template>
  <v-dialog v-model="isOpen" max-width="400">
    <v-card>
      <v-card-title class="text-h6">
        {{ title || "Confirmar exclusão" }}
      </v-card-title>

      <v-card-text>
        {{ message || "Tem certeza que deseja excluir este item?" }}
      </v-card-text>

      <v-card-actions class="justify-end">
        <v-btn variant="text" @click="closeDialog">Cancelar</v-btn>
        <v-btn color="error" variant="flat" @click="confirmDelete">
          Excluir
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      :timeout="4000"
      location="top right"
      variant="flat"
  >
    {{ snackbar.message }}

    <template v-slot:actions>
      <v-btn
          icon
          variant="text"
          @click="snackbar.show = false"
      >
        <v-icon>mdi-close</v-icon>
      </v-btn>
    </template>
  </v-snackbar>
</template>

<script setup>
import { ref, watch } from "vue";

const props = defineProps({
  modelValue: { type: Boolean, required: true },
  item: { type: Object, required: true },
  deleteService: { type: Function, required: true },
  title: { type: String, default: "" },
  message: { type: String, default: "" },
  successMessage: { type: String, default: "Item excluído com sucesso!" },
  errorMessage: { type: String, default: "Erro ao excluir item." }
});

const emit = defineEmits(["update:modelValue", "deleted", "delete-error"]);

const isOpen = ref(props.modelValue);
watch(() => props.modelValue, val => (isOpen.value = val));
watch(isOpen, val => emit("update:modelValue", val));

const snackbar = ref({
  show: false,
  message: "",
  color: "success",
});

function showSnackbar(message, color = "success") {
  snackbar.value = { show: true, message, color };
}

function closeDialog() {
  isOpen.value = false;
}

async function confirmDelete() {
  try {
    await props.deleteService(props.item.id);

    showSnackbar(props.successMessage, "success");

    emit("deleted", props.item.id);

    closeDialog();

  } catch (error) {
    console.error(error);

    showSnackbar(props.errorMessage, "error");

    emit("delete-error", error);
  }
}
</script>