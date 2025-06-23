// // frontend/src/services/authService.js
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.message || "An error occurred";
    return Promise.reject(new Error(message));
  }
);

export const login = async (credentials) => {
  const response = await api.post("/auth/login", credentials);
  if (response.token) {
    localStorage.setItem("token", response.token);
    localStorage.setItem("user", JSON.stringify(response.user));
  }
  return response;
};

export const register = async (userData) => {
  const response = await api.post("/auth/register", userData);
  if (response.token) {
    localStorage.setItem("token", response.token);
    localStorage.setItem("user", JSON.stringify(response.user));
  }
  return response;
};

export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

export const getCurrentUser = () => {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};

export const isAuthenticated = () => {
  return !!localStorage.getItem("token");
};

