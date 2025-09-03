"use client";

import { useEffect } from "react";
import useAuthStore from "@/stores/authStore";
import API from "@/lib/api";

const AuthInitializer = () => {
  const { setUser, clearUser } = useAuthStore();

  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const res = await API.get("/auth/status");
          if (res.data.isAuthenticated) {
            setUser(res.data.user);
          }
        } catch (error) {
          console.error("Auth check failed:", error);
          localStorage.removeItem("token");
          clearUser();
        }
      }
    };
    checkAuthStatus();
  }, [setUser, clearUser]);

  return null;
};

export default AuthInitializer;
