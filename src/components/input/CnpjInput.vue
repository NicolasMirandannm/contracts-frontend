<script setup>
import { ref, watch } from "vue";

const props = defineProps({
  modelValue: String,
  readonly: Boolean,
  required: Boolean,
});

const emit = defineEmits(["update:modelValue"]);

const inputValue = ref("");

watch(
    () => props.modelValue,
    (val) => {
      inputValue.value = formatCNPJ(val || "");
    },
    { immediate: true }
);

function formatCNPJ(value) {
  if (!value) return "";
  return value
      .replace(/\D/g, "")
      .replace(/^(\d{2})(\d)/, "$1.$2")
      .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
      .replace(/\.(\d{3})(\d)/, ".$1/$2")
      .replace(/(\d{4})(\d)/, "$1-$2")
      .slice(0, 18);
}

function removeMask(value) {
  return value.replace(/\D/g, "");
}

function onModelUpdate(val) {
  const formatted = formatCNPJ(val);
  inputValue.value = formatted;
  emit("update:modelValue", removeMask(formatted));
}
</script>

<template>
  <v-text-field
      :model-value="inputValue"
      density="comfortable"
      variant="outlined"
      @update:modelValue="onModelUpdate"
      label="CNPJ"
      maxlength="18"
      :readonly="readonly"
      :disabled="readonly"
      :rules="required ? [v => !!v || 'Campo obrigatório'] : []"
      :required="required"
      placeholder="00.000.000/0000-00"
  />
</template>
