<template>
  <v-app>
    <v-main
        class="d-flex align-center justify-center bg-background"
        style="min-height: 100vh;"
    >
      <v-card
          class="pa-10 mx-4 bg-surface"
          max-width="500"
          width="100%"
          elevation="3"
          rounded="xl"
      >
        <div class="text-center mb-6">
          <h1 class="text-h4 font-weight-bold text-primary">DiarixPro</h1>
          <p class="text-body-1 text-secondary">Cadastro de Usuário</p>
        </div>

        <v-card-title class="text-h5 font-weight-bold text-center mb-6 opacity-60">
          Criar Conta
        </v-card-title>

        <v-form @submit.prevent="onRegister" ref="form" v-model="valid">
          <v-text-field
              v-model="name"
              type="text"
              label="Nome completo"
              variant="outlined"
              density="comfortable"
              required
              hide-details="auto"
              rounded="lg"
              class="mb-4"
              :rules="[rules.required]"
              color="primary"
          />

          <PhoneNumberInput v-model="phone"/>

          <v-text-field
              v-model="email"
              label="E-mail"
              type="email"
              variant="outlined"
              density="comfortable"
              required
              hide-details="auto"
              rounded="lg"
              class="mb-4"
              :rules="[rules.required, rules.email]"
              color="primary"
          />

          <v-text-field
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              label="Senha"
              variant="outlined"
              density="comfortable"
              prepend-inner-icon="mdi-lock-outline"
              :append-inner-icon="showPassword ? 'mdi-eye-off-outline' : 'mdi-eye-outline'"
              @click:append-inner="showPassword = !showPassword"
              required
              hide-details="auto"
              rounded="lg"
              class="mb-4"
              color="primary"
          />

          <v-text-field
              v-if="password"
              v-model="confirmPassword"
              :type="showConfirmPassword ? 'text' : 'password'"
              label="Confirme a senha"
              variant="outlined"
              density="comfortable"
              prepend-inner-icon="mdi-lock-check-outline"
              :append-inner-icon="showConfirmPassword ? 'mdi-eye-off-outline' : 'mdi-eye-outline'"
              @click:append-inner="showConfirmPassword = !showConfirmPassword"
              required
              hide-details="auto"
              rounded="lg"
              class="mb-6"
              :rules="[rules.required, rules.matchPassword]"
              color="primary"
          />

          <v-btn
              type="submit"
              color="primary"
              block
              class="mb-4 text-body-1 text-capitalize"
              size="x-large"
              rounded="lg"
          >
            Criar Conta
          </v-btn>

          <!-- Link para login -->
          <div class="d-flex justify-center align-center text-caption">
            <span class="text-secondary mr-1">Já possui conta?</span>
            <v-btn
                variant="text"
                color="primary"
                class="text-caption font-weight-medium pa-0"
                style="text-transform: none;"
                @click="onLogin"
            >
              Entrar
            </v-btn>
          </div>
        </v-form>
      </v-card>
    </v-main>
  </v-app>
</template>

<script setup>
import { ref } from "vue";
import PhoneNumberInput from "@/components/input/PhoneNumberInput.vue";
import { useRouter } from "vue-router";
import RouteConstants from "@/router/RouteConstants.js";
import UserService from "@/api/services/contract-manager/UserService.js";
import SignUpDto from "@/api/services/contract-manager/SignUpDto.js";
import { useAlert } from "@/composables/useAlert.js";

const router = useRouter();
const { showAlert } = useAlert()

const name = ref("");
const phone = ref("");
const email = ref("");
const password = ref("");
const confirmPassword = ref("");

const showPassword = ref(false);
const showConfirmPassword = ref(false);

const valid = ref(false);
const rules = {
  required: (v) => !!v || "Campo obrigatório",
  email: (v) => /.+@.+\..+/.test(v) || "E-mail inválido",
  matchPassword: (v) => v === password.value || "As senhas não coincidem",
};

const onRegister = () => {
  if (valid.value) {
    UserService.signUp(new SignUpDto(
        name.value,
        phone.value,
        email.value,
        password.value
    )).then(() => {
      showAlert({
        msg: "Cadastro realizado com sucesso! Você será redirecionado para a página principal.",
        type: 'success'
      })
      router.push({ name: RouteConstants.HOME.name });
    }).catch((error) => {
      console.error("Erro ao cadastrar usuário:", error);
      showAlert({ msg: "Ocorreu um erro ao tentar cadastrar. Por favor, tente novamente.", type: 'error' });
    });
  }
};

const onLogin = () => {
  router.push({ name: RouteConstants.LOGIN.name })
};
</script>

<style scoped>
.login-title {
  color: #194ea1;
  opacity: 0.8;
}
</style>