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

// Category-based defect photo fallbacks
export const getCategoryFallbackImage = (category = "") => {
  const cat = (category || "").toLowerCase();
  if (cat.includes("water") || cat.includes("leak") || cat.includes("pipe") || cat.includes("குடிநீர்") || cat.includes("தண்ணீர்")) {
    return "https://images.unsplash.com/photo-1585672840542-a89e6e8e89fe?w=800&q=80"; // Water pipeline / leakage
  }
  if (cat.includes("garb") || cat.includes("waste") || cat.includes("trash") || cat.includes("dump") || cat.includes("குப்பை")) {
    return "https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=800&q=80"; // Garbage dump
  }
  if (cat.includes("drain") || cat.includes("sewer") || cat.includes("manhole") || cat.includes("சாக்கடை")) {
    return "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=800&q=80"; // Drainage / sewer
  }
  if (cat.includes("light") || cat.includes("lamp") || cat.includes("electric") || cat.includes("மின்")) {
    return "https://images.unsplash.com/photo-1509114397022-ed747cca3f65?w=800&q=80"; // Streetlight
  }
  return "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&q=80"; // Pothole / Road damage
};

// Helper to format image URLs whether they are Base64 data URIs, full URLs (Cloudinary/Unsplash), or local /uploads
export const formatImageUrl = (url, category = "") => {
  if (!url) {
    return getCategoryFallbackImage(category);
  }
  // Base64 Data URI
  if (url.startsWith("data:image/")) {
    return url;
  }
  // HTTP/HTTPS URL
  if (url.startsWith("http://") || url.startsWith("https://")) {
    // If backend returned localhost URL but client is deployed (e.g. Netlify/Vercel), resolve relative to active SERVER_BASE_URL
    if (
      typeof window !== "undefined" &&
      window.location.hostname !== "localhost" &&
      window.location.hostname !== "127.0.0.1" &&
      (url.includes("localhost:") || url.includes("127.0.0.1:"))
    ) {
      const filename = url.replace(/\\/g, "/").split("/").pop();
      return `${SERVER_BASE_URL}/uploads/${filename}`;
    }
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
