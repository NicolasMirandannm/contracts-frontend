<script setup>
import { ref, watch } from "vue";

const props = defineProps({
  modelValue: String,
  readonly: Boolean,
  required: Boolean,
});

const emit = defineEmits(["update:modelValue"]);

const inputValue = ref(props.modelValue || "");

watch(
    () => props.modelValue,
    (val) => {
      inputValue.value = val || "";
    }
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

function onInput(e) {
  const formatted = formatCNPJ(e.target.value);
  inputValue.value = formatted;
  emit("update:modelValue", formatted);
}
</script>

<template>
  <v-text-field
      :model-value="inputValue"
      density="comfortable"
      variant="outlined"
      @input="onInput"
      label="CNPJ"
      maxlength="18"
      :readonly="readonly"
      :disabled="readonly"
      :rules="[v => !!v || 'Campo obrigatório']"
      :required="required"
  />
</template>
