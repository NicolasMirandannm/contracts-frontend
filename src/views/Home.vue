<template>
  <v-app >
    <v-app-bar flat density="comfortable">
      <v-toolbar-title class="text-h6 font-weight-bold">
        <img src="@/assets/diarix_logo.png" alt="DiarixPro Logo" style="height: 80px;" />
      </v-toolbar-title>

      <div class="d-flex align-center pa-2" style="gap: 12px;">
        <v-chip variant="outlined" color="primary" size="small" rounded="lg">
          Bem vindo, {{user?.name?.split(" ")?.[0]}}
        </v-chip>
        <v-btn color="error" variant="tonal" size="small" rounded="lg" @click="logout">Logout</v-btn>
      </div>
    </v-app-bar>

    <v-main>
      <v-container fluid class="py-4">
        <v-row dense class="mb-4">
          <v-col
              cols="12"
              sm="6"
              md="3"
              v-for="card in resumo"
              :key="card.titulo"
          >
            <v-card
                elevation="2"
                class="pa-4 text-center d-flex flex-column align-center justify-center"
                rounded="xl"
            >
              <div class="text-subtitle-2">{{ card.titulo }}</div>
              <div class="text-h6 font-weight-bold mt-1" :class="card.cor">
                {{ card.valor }}
              </div>
            </v-card>
          </v-col>
        </v-row>

        <v-tabs
            v-model="selectedTab"
            color="blue-darken-2"
            align-tabs="center"
            grow
        >
          <v-tab value="diaristas">Diaristas</v-tab>
          <v-tab value="empresas">Empresas</v-tab>
          <v-tab value="diarias">Diárias</v-tab>
          <v-tab value="pagamentos">Pagamentos</v-tab>
        </v-tabs>

        <v-window v-model="selectedTab" class="mt-4" :touch="false">
          <v-window-item value="diaristas">
            <DayLaborer />
          </v-window-item>

          <v-window-item value="empresas">
            <Enterprise />
          </v-window-item>

          <v-window-item value="diarias">
            <DailyWage />
          </v-window-item>

          <v-window-item value="pagamentos">
            <Payment />
          </v-window-item>
        </v-window>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import { onMounted, ref } from "vue";
import Enterprise from "@/views/enterprise/Enterprise.vue";
import UserService from "@/api/services/manager/UserService.js";
import { useRouter } from "vue-router";
import { useAlert } from "@/composables/useAlert.js";
import RouteConstants from "@/router/RouteConstants.js";
import DayLaborer from "@/views/day-laborer/DayLaborer.vue";
import DailyWage from "@/views/daily-wage/DailyWage.vue";
import Payment from "@/views/payment/Payment.vue";

const router = useRouter();
const { showAlert } = useAlert();


const selectedTab = ref("diarias");

const resumo = [
  { titulo: "Total Empresas", valor: "12", cor: "text-primary" },
  { titulo: "Total Diaristas", valor: "34", cor: "text-primary" },
  { titulo: "Diarias Realizadas (todo - colocar o mes vigente)", valor: "27", cor: "text-primary" },
  { titulo: "Lucro Mês", valor: "R$ 4.000,00", cor: "text-success" },
];

const user = ref({ name: '' });

function logout() {
  UserService.signOut()
  router.push(RouteConstants.LOGIN.push());
}

onMounted(() => {
  const userId = UserService.getCurrentUser().id;
  UserService.findById(userId)
      .then(response => {
        user.value = response;
      })
      .catch(error => {
        const msg = error.response?.message || "Ocorreu um erro na busca do usuário no servidor.";
        showAlert({ msg, type: "error" });
      });
});

</script>
