<template>
  <v-card elevation="1" rounded="xl" class="pa-4 mb-4">
    <v-card-text>
      <v-row dense align="center">
        <!-- Campo Nome -->
        <v-col cols="12" sm="4" md="2">
          <v-text-field
              v-model="filtros.nomeDiarista"
              label="Informe o nome do diarista..."
              variant="outlined"
              density="comfortable"
              clearable
              hide-details
          />
        </v-col>

        <!-- Campo CNPJ -->
        <v-col cols="12" sm="4" md="2">
          <v-text-field
              v-model="filtros.nomeEmpresa"
              label="Informe o nome da empresa..."
              variant="outlined"
              density="comfortable"
              clearable
              hide-details
          />
        </v-col>

        <v-col cols="12" sm="4" md="2">
          <v-text-field
              v-model="filtros.dataDiaria"
              label="Informe a data da diária..."
              variant="outlined"
              density="comfortable"
              clearable
              hide-details
          />
        </v-col>

        <!-- Filtro Status -->
        <v-col cols="12" sm="6" md="3" class="d-flex align-center">
          <v-btn-toggle
              v-model="filtros.status"
              color="primary"
              variant="outlined"
              rounded="lg"
              mandatory
              class="w-100"
          >
            <v-btn value="ativo">Pagas</v-btn>
            <v-btn value="inativo">Não pagas</v-btn>
            <v-btn value="todos">Todas</v-btn>
          </v-btn-toggle>
        </v-col>

        <v-col cols="12" sm="6" md="3" class="d-flex align-center justify-end gap-2">
          <div class="w-100 d-flex justify-center align-center">
            <v-btn
                color="primary"
                variant="tonal"
                prepend-icon="mdi-magnify"
                rounded="lg"
                @click="onFiltrar"
            >
              Filtrar
            </v-btn>
            <v-spacer style="max-width: 24px" />
            <v-btn
                color="primary"
                variant="flat"
                prepend-icon="mdi-plus"
                rounded="lg"
                @click="$emit('cadastrar')"
            >
              Cadastrar
            </v-btn>
          </div>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { ref } from "vue";

const filtros = ref({
  nome: "",
  cnpj: "",
  status: "todos", // valor inicial
});

const onCadastrar = () => {
  console.log("Cadastrar clicado com filtros:", filtros.value);
};

const onFiltrar = () => {
  console.log("Filtrar com valores:", filtros.value);
};
</script>
