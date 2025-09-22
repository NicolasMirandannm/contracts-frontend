<template>
  <v-app>
    <v-main class="d-flex align-center justify-center bg-grey-lighten-4" style="min-height: 100vh;">
      <v-card
          class="pa-10 mx-4"
          max-width="500"
          width="100%"
          elevation="3"
          rounded="xl"
          style="border: 1px solid rgba(168,197,255,0.72);"
      >
        <div class="text-center mb-6">
          <h1 class="text-h4 font-weight-bold text-primary">DiarixPro</h1>
          <p class="text-body-1 text-grey-darken-1">Gestão de Diárias Simplificada</p>
        </div>
        <v-card-title class="text-h5 font-weight-bold text-center mb-6 login-title">
          Login
        </v-card-title>


        <v-form @submit.prevent="onSubmit" ref="form" v-model="valid">
          <v-text-field
              v-model="email"
              label="E-mail"
              type="email"
              variant="outlined"
              density="comfortable"
              prepend-inner-icon="mdi-email-outline"
              required
              hide-details
              rounded="lg"
              class="mb-4"
              :rules="[rules.required]"
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
              hide-details
              rounded="lg"
              class="mb-6"
              :rules="[rules.required]"
          />

          <v-btn
              type="submit"
              color="primary"
              block
              class="mb-4 text-body-1"
              size="x-large"
              rounded="lg"
          >
            Entrar
          </v-btn>

          <div class="d-flex justify-center align-center text-caption">
            <span class="text-grey-darken-1 mr-1">Ainda não tem conta?</span>
            <v-btn
                variant="text"
                color="primary"
                class="text-caption font-weight-medium pa-0"
                @click="onRegister"
            >
              Cadastre-se
            </v-btn>
          </div>
        </v-form>
      </v-card>
    </v-main>
  </v-app>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from "vue-router";
import RouteConstants from "@/router/RouteConstants.js";
import { useAlert } from "@/composables/useAlert.js";
import UserService from "@/api/services/contract-manager/UserService.js";

const router = useRouter();
const { showAlert } = useAlert()

const showPassword = ref(false);

const email = ref('');
const password = ref('');

const valid = ref(false);
const rules = { required: (v) => !!v || "Campo obrigatório" };

const onSubmit = () => {
  if (valid.value) {
    UserService.signIn(email.value, password.value).then(() => {
      showAlert({
        msg: "Autenticação realizada com sucesso!",
        type: 'success'
      })
      router.push({ name: RouteConstants.HOME.name });
    }).catch((error) => {
      console.error("Erro ao realizar autenticação:", error.response);
      let msg = error.response?.data?.message || "Ocorreu um erro na autenticação. Verifique suas credenciais e tente novamente."
      showAlert({ msg, type: 'error' });
    });
  } else {
    showAlert({ type: 'error', msg: 'Por favor, preencha todos os campos corretamente.' })
  }
}

const onRegister = () => {
  email.value = '';
  password.value = '';
  router.push({ name: RouteConstants.SIGN_UP.name })
}
</script>

<style scoped>
.login-title {
  color: #194ea1;
  opacity: 0.50;
}
</style>
