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
              <v-icon size="36" class="mb-2" :class="card.cor">
                {{ card.icon }}
              </v-icon>

              <div class="text-subtitle-1 font-weight-medium">{{ card.titulo }}</div>
              <div class="text-h5 font-weight-bold mt-2" :class="card.cor">
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
          <v-tab value="diarias">Diárias</v-tab>
          <v-tab value="pagamentos">Pagamentos</v-tab>
          <v-tab value="diaristas">Diaristas</v-tab>
          <v-tab value="empresas">Empresas</v-tab>
        </v-tabs>

        <v-window v-model="selectedTab" class="mt-4" :touch="false">
          <v-window-item value="diarias">
            <DailyWage />
          </v-window-item>

          <v-window-item value="pagamentos">
            <Payment />
          </v-window-item>

          <v-window-item value="diaristas">
            <DayLaborer />
          </v-window-item>

          <v-window-item value="empresas">
            <Enterprise />
          </v-window-item>
        </v-window>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import {onMounted, ref} from "vue";
import Enterprise from "@/views/enterprise/Enterprise.vue";
import UserService from "@/api/services/manager/UserService.js";
import {useRouter} from "vue-router";
import {useAlert} from "@/composables/useAlert.js";
import RouteConstants from "@/router/RouteConstants.js";
import DayLaborer from "@/views/day-laborer/DayLaborer.vue";
import DailyWage from "@/views/daily-wage/DailyWage.vue";
import Payment from "@/views/payment/Payment.vue";
import EnterpriseService from "@/api/services/enterprise/EnterpriseService.js";
import DayLaborerService from "@/api/services/day-laborer/DayLaborerService.js";
import DailyWageService from "@/api/services/daily-wage/DailyWageService.js";

const router = useRouter();
const { showAlert } = useAlert();


const selectedTab = ref("diarias");
const user = ref({ name: "" });

const monthName = new Date()
    .toLocaleDateString('pt-BR', { month: 'long' })
    .replace(/^./, (letra) => letra.toUpperCase());

const resumo = ref([
  { titulo: "Total Empresas", valor: "—", cor: "text-primary", icon: "mdi-office-building" },
  { titulo: "Total Diaristas", valor: "—", cor: "text-primary", icon: "mdi-account-group" },
  { titulo: `Diárias realizadas em ${monthName}`, valor: "-", cor: "text-primary", icon: "mdi-calendar-check" },
  { titulo: "Lucro Mensal", valor: "R$ -", cor: "text-success", icon: "mdi-cash-multiple" },
]);

const logout = () => {
  UserService.signOut();
  router.push(RouteConstants.LOGIN.push());
};

const loadEmpresas = async () => {
  try {
    const empresas = await EnterpriseService.findAll();
    resumo.value[0].valor = empresas.totalElements;
  } catch (error) {
    console.error("Erro ao buscar empresas:", error);
    resumo.value[0].valor = "0";
  }
};

const loadDiaristas = async () => {
  try {
    const diaristas = await DayLaborerService.findAll();
    resumo.value[1].valor = diaristas.totalElements;
  } catch (error) {
    console.error("Erro ao buscar diaristas:", error);
    resumo.value[1].valor = "0";
  }
};

const loadDiarias = async () => {
  try {
    resumo.value[2].valor = await DailyWageService.totalCurrentMonth();
  } catch (error) {
    console.error("Erro ao buscar diarias:", error);
    resumo.value[2].valor = "0";
  }
};

const loadLucroMensal = async () => {
  try {
    const total = await DailyWageService.totalProfitCurrentMonth();
    const valorNumerico = Number(total) || 0;

    resumo.value[3].valor = valorNumerico.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });

    resumo.value[3].cor = valorNumerico < 0 ? "text-error" : "text-success";
  } catch (error) {
    console.error("Erro ao buscar lucro mensal:", error);
    resumo.value[3].valor = "R$ 0,00";
    resumo.value[3].cor = "text-success";
  }
};

onMounted(async () => {
  try {
    const userId = UserService.getCurrentUser().id;
    user.value = await UserService.findById(userId);
  } catch (error) {
    const msg = error.response?.message || "Ocorreu um erro na busca do usuário no servidor.";
    showAlert({ msg, type: "error" });
  }

  await loadEmpresas();
  await loadDiaristas();
  await loadDiarias();
  await loadLucroMensal();
});

</script>
