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
          Recuperar Senha
        </v-card-title>

        <v-form @submit.prevent="onSubmit" ref="form" v-model="valid">
          <v-text-field
              v-model="email"
              label="Digite seu e-mail"
              type="email"
              variant="outlined"
              density="comfortable"
              prepend-inner-icon="mdi-email-outline"
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
            Enviar link de recuperação
          </v-btn>

          <div class="d-flex justify-center align-center text-caption">
            <span class="text-grey-darken-1 mr-1">Lembrou sua senha?</span>
            <v-btn
                variant="text"
                color="primary"
                class="text-caption font-weight-medium pa-0"
                @click="onBackToLogin"
            >
              Voltar ao login
            </v-btn>
          </div>
        </v-form>
      </v-card>
    </v-main>
  </v-app>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import RouteConstants from "@/router/RouteConstants.js";
import { useAlert } from "@/composables/useAlert.js";
import UserService from "@/api/services/contract-manager/UserService.js";

const router = useRouter();
const { showAlert } = useAlert();

const email = ref("");
const valid = ref(false);
const rules = { required: (v) => !!v || "Campo obrigatório" };

const onSubmit = () => {
  if (valid.value) {
    showAlert({ type: "error", msg: "Implementar" });
    // UserService.requestPasswordRecovery(email.value)
    //     .then(() => {
    //       showAlert({
    //         msg: "Se este e-mail estiver cadastrado, enviaremos instruções de recuperação.",
    //         type: "success",
    //       });
    //       router.push({ name: RouteConstants.LOGIN.name });
    //     })
    //     .catch((error) => {
    //       console.error("Erro ao solicitar recuperação:", error.response);
    //       let msg = error.response?.data?.message || "Erro ao solicitar recuperação de senha.";
    //       showAlert({ msg, type: "error" });
    //     });
  } else {
    showAlert({ type: "error", msg: "Informe seu e-mail para continuar." });
  }
};

const onBackToLogin = () => {
  router.push({ name: RouteConstants.LOGIN.name });
};
</script>

<style scoped>
.login-title {
  color: #194ea1;
  opacity: 0.80;
}
</style>
