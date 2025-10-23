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

function formatCPF(value) {
  if (!value) return "";
  return value
      .replace(/\D/g, "")
      .replace(/^(\d{3})(\d)/, "$1.$2")
      .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
      .replace(/\.(\d{3})(\d)/, ".$1-$2")
      .slice(0, 14);
}

function onInput(e) {
  const formatted = formatCPF(e.target.value);
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
      label="CPF"
      maxlength="14"
      :readonly="readonly"
      :disabled="readonly"
      :rules="[v => !!v || 'Campo obrigatório']"
      :required="required"
  />
</template>
