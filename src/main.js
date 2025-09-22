import { createApp } from 'vue'
import App from './App.vue'
import router from "@/router/index.js";
import vuetify from "@/plugins/vuetify.js";
import { VueMaskDirective } from 'v-mask'

const app = createApp(App)

app.use(router)
app.use(vuetify)
app.directive('mask', VueMaskDirective)

app.mount('#app')
