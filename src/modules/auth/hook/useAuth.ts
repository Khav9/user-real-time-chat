// useAuth.ts

import { apiClient } from "@/api/api";
import { useState, useCallback, useEffect } from "react";
import { setAuthToken } from "@/api/api";

interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
}

// Store token in memory only
let memoryToken: string | null = null;

// Initialize token from sessionStorage on module load
const initializeToken = () => {
  const storedToken = sessionStorage.getItem("auth_token");
  if (storedToken) {
    memoryToken = storedToken;
    setAuthToken(storedToken);
  }
};

// Initialize token
initializeToken();

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>(() => ({
    isAuthenticated: !!memoryToken,
    token: memoryToken,
  }));

  // Debug current auth state
  useEffect(() => {
    console.log("Current auth state:", {
      isAuthenticated: authState.isAuthenticated,
      hasToken: !!authState.token,
      hasMemoryToken: !!memoryToken,
    });
  }, [authState]);

  const login = useCallback(async (username: string, password: string) => {
    console.log("Attempting login...");
    try {
      const response = await apiClient.post<{ access_token: string }>(
        "/auth/login",
        {
          username,
          password,
        }
      );

      console.log("Login response received:", {
        hasToken: !!response.access_token,
        tokenLength: response.access_token?.length,
      });

      if (!response.access_token) {
        throw new Error("No access token received from server");
      }

      // Store token in memory and sessionStorage
      memoryToken = response.access_token;
      sessionStorage.setItem("auth_token", response.access_token);
      setAuthToken(response.access_token);

      // Update auth state
      setAuthState({
        isAuthenticated: true,
        token: response.access_token,
      });

      console.log("Login successful, auth state updated");
      return { success: true };
    } catch (error) {
      console.error("Login failed:", error);
      // Clear any partial state
      memoryToken = null;
      sessionStorage.removeItem("auth_token");
      setAuthToken(null);
      setAuthState({
        isAuthenticated: false,
        token: null,
      });
      return { success: false, error };
    }
  }, []);

  const logout = useCallback(() => {
    console.log("Logging out...");
    // Clear token from memory and sessionStorage
    memoryToken = null;
    sessionStorage.removeItem("auth_token");
    setAuthToken(null);

    // Update auth state
    setAuthState({
      isAuthenticated: false,
      token: null,
    });
    console.log("Logout complete");
  }, []);

  // Sync state with memory token
  useEffect(() => {
    if (memoryToken && !authState.isAuthenticated) {
      console.log("Syncing auth state with memory token");
      setAuthState({
        isAuthenticated: true,
        token: memoryToken,
      });
    }
  }, [authState.isAuthenticated]);

  return {
    isAuthenticated: authState.isAuthenticated,
    token: authState.token,
    login,
    logout,
  };
}
