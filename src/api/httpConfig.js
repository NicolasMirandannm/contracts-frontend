import axios from "axios";

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
  error => {
    console.log(error.response)
    if (error.response && [401, 403].includes(error.response.status)) {
      window.location = '/login';
    }
    return Promise.reject(error);
  },
);

export default httpConfig;
