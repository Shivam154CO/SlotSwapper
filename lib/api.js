import axios from "axios";

// ⚠️ TEMPORARY FIX: Hardcode the URL that has the CORRECT CORS configuration
const API_BASE_URL = "https://slotswapper1-wvsm.onrender.com/api"; 

console.log("[Frontend] Using API URL (Hardcoded):", API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;