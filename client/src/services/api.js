import axios from "axios";

// Environment-aware API URL (Vercel / Production / Localhost)
export const API_BASE_URL = (() => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  if (
    typeof window !== "undefined" &&
    window.location.hostname !== "localhost" &&
    window.location.hostname !== "127.0.0.1"
  ) {
    return "https://civic-ai-backend-1e5y.onrender.com/api";
  }
  return "http://localhost:5000/api";
})();

// Base server URL without the /api suffix (for uploads and static assets)
export const SERVER_BASE_URL = API_BASE_URL.replace(/\/api\/?$/, "");

// Helper to format image URLs whether they are full URLs (Cloudinary/Unsplash) or local /uploads
export const formatImageUrl = (url) => {
  if (!url) {
    return "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&q=80";
  }
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }
  const filename = url.replace(/\\/g, "/").split("/").pop();
  return `${SERVER_BASE_URL}/uploads/${filename}`;
};

const API = axios.create({
  baseURL: API_BASE_URL,
});

// Request interceptor to inject JWT token
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("civic_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default API;

