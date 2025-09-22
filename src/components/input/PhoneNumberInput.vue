<template>
  <v-text-field
      :model-value="phoneMasked"
      label="Telefone"
      type="tel"
      inputmode="numeric"
      variant="outlined"
      density="comfortable"
      :rules="[rules.required, rules.phone]"
      required
      hide-details="auto"
      rounded="lg"
      class="mb-4"
      maxlength="15"
      @update:model-value="onPhoneInput"
  />
</template>

<script setup>
import { ref, watch, defineProps, defineEmits } from "vue";

const props = defineProps({
  modelValue: {
    type: String,
    default: "",
  },
});

const emit = defineEmits(["update:modelValue"]);

const phoneDigits = ref(props.modelValue.replace(/\D/g, "").slice(0, 11));
const phoneMasked = ref(formatPhone(phoneDigits.value));

const rules = {
  required: (v) => !!v || "Campo obrigatório",
  phone: (v) => {
    const digits = (v || "").replace(/\D/g, "");
    return digits.length === 10 || digits.length === 11 || "Número de telefone inválido";
  },
};

function formatPhone(d) {
  const digits = (d || "").replace(/\D/g, "").slice(0, 11);
  if (!digits) return "";
  if (digits.length <= 2) return `(${digits}`;
  const ddd = digits.slice(0, 2);
  const rest = digits.slice(2);

  if (rest.length <= 4) return `(${ddd}) ${rest}`;
  if (rest.length <= 8) {
    return `(${ddd}) ${rest.slice(0, 4)}${rest.length > 4 ? "-" + rest.slice(4) : ""}`;
  }
  return `(${ddd}) ${rest.slice(0, 5)}-${rest.slice(5)}`;
}

function onPhoneInput(newVal) {
  const digits = (newVal || "").replace(/\D/g, "").slice(0, 11);
  phoneDigits.value = digits;
  phoneMasked.value = formatPhone(digits);
  emit("update:modelValue", digits); // sempre emitir o valor "raw" para o pai
}

watch(
    () => props.modelValue,
    (val) => {
      phoneDigits.value = (val || "").replace(/\D/g, "").slice(0, 11);
      phoneMasked.value = formatPhone(phoneDigits.value);
    }
);
</script>
