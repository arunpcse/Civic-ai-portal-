import React, { createContext, useState, useEffect } from "react";
import API from "../services/api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if token exists and load user profile
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("civic_token");
      if (token) {
        try {
          const res = await API.get("/auth/profile");
          if (res.data.success) {
            setCurrentUser(res.data.user);
          } else {
            logout();
          }
        } catch (err) {
          console.error("Auth check failed:", err.message);
          logout();
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await API.post("/auth/login", { email, password });
      if (res.data.success) {
        localStorage.setItem("civic_token", res.data.token);
        setCurrentUser(res.data.user);
        return { success: true, user: res.data.user };
      }
      return { success: false, message: res.data.message || "Login failed." };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || "Cannot connect to server.",
      };
    }
  };

  const registerUser = async (name, email, password, phone, address, ward) => {
    try {
      const res = await API.post("/auth/register", {
        name,
        email,
        password,
        phone,
        address,
        ward,
      });
      if (res.data.success) {
        localStorage.setItem("civic_token", res.data.token);
        setCurrentUser(res.data.user);
        return { success: true, user: res.data.user };
      }
      return { success: false, message: res.data.message || "Registration failed." };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || "Cannot connect to server.",
      };
    }
  };

  const logout = () => {
    localStorage.removeItem("civic_token");
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider value={{ currentUser, loading, login, registerUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
