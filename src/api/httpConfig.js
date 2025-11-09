import axios from "axios";
import UserService from "@/api/services/manager/UserService.js";
import router from "@/router/index.js";
import RouteConstants from "@/router/RouteConstants.js";

const httpConfig = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
        "Content-Type": "application/json",
    },
});


httpConfig.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

httpConfig.interceptors.response.use(
  response => response,
  async error => {
    if (error.response && [401, 403].includes(error.response.status)) {
      UserService.signOut();
      if (router.currentRoute.value.name !== RouteConstants.LOGIN.name) {
        alert("Usuário não autorizado. Por favor, faça login novamente.");
        await router.push(RouteConstants.LOGIN.push());
      }
    }

    return Promise.reject(error);
  },
);

export default httpConfig;
