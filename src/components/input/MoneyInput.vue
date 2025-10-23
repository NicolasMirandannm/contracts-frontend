<script setup>
import { ref, watch } from "vue";

const props = defineProps({
  modelValue: {
    type: [Number, String],
    default: "",
  },
  label: {
    type: String,
    default: "Valor",
  },
  readonly: Boolean,
  disabled: Boolean,
  required: Boolean,
});

const emit = defineEmits(["update:modelValue"]);

const displayValue = ref("");

watch(
    () => props.modelValue,
    (val) => {
      if (val === null || val === undefined || val === "") {
        displayValue.value = "";
      } else {
        displayValue.value = formatarMoeda(val);
      }
    },
    { immediate: true }
);

function formatarMoeda(valor) {
  const numero = typeof valor === "number" ? valor : parseFloat(valor);
  if (isNaN(numero)) return "";
  return numero.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function handleInput(e) {
  let valor = e.target.value.replace(/\D/g, "");
  valor = (Number(valor) / 100).toFixed(2);
  emit("update:modelValue", parseFloat(valor));
  displayValue.value = formatarMoeda(valor);
}
</script>

<template>
  <v-text-field
      :label="label"
      :readonly="readonly"
      :disabled="disabled"
      :required="required"
      :model-value="displayValue"
      density="comfortable"
      variant="outlined"
      @input="handleInput"
  />
</template>
