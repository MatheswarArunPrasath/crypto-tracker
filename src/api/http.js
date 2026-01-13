import axios from "axios";

const http = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL || "http://localhost:5000",
  timeout: 10000,
});

http.interceptors.response.use(
  (res) => res,
  (err) => {
    err._message = err.response?.data?.error || err.message || "Network error";
    return Promise.reject(err);
  }
);

export default http;
