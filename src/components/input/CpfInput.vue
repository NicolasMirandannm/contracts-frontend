<script setup>
import { ref, watch } from "vue";

const props = defineProps({
  modelValue: String,
  readonly: Boolean,
  required: Boolean,
});

const emit = defineEmits(["update:modelValue"]);

const inputValue = ref(formatCPF(props.modelValue) || "");

watch(
    () => props.modelValue,
    (newValue) => {
      inputValue.value = formatCPF(newValue) || "";
    }
);

function formatCPF(value) {
  if (!value) return "";
  const numbers = value.replace(/\D/g, "");
  if (numbers.length <= 3) return numbers;
  if (numbers.length <= 6) return `${numbers.slice(0, 3)}.${numbers.slice(3)}`;
  if (numbers.length <= 9) return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`;
  return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9, 11)}`;
}

function onInput(e) {
  const rawValue = e.target.value;
  const formatted = formatCPF(rawValue);
  inputValue.value = formatted;

  const unmaskedValue = formatted.replace(/\D/g, "");
  emit("update:modelValue", unmaskedValue);
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
      :rules="required ? [v => !!v || 'Campo obrigatório'] : []"
      :required="required"
      placeholder="000.000.000-00"
  />
</template>
