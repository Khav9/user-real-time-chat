// useAuth.ts

import { apiClient, userApi } from "@/api/api";
import type { User } from "@/api/api";
import { useState, useCallback, useEffect } from "react";
import { setAuthToken } from "@/api/api";
import { useQueryClient } from "@tanstack/react-query";

interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  user: User | null;
}

// Store token and user data in memory only
let memoryToken: string | null = null;
let memoryUser: User | null = null;

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
    user: memoryUser,
  }));

  const queryClient = useQueryClient();

  // Debug current auth state
  useEffect(() => {
    console.log("Current auth state:", {
      isAuthenticated: authState.isAuthenticated,
      hasToken: !!authState.token,
      hasMemoryToken: !!memoryToken,
      hasUser: !!authState.user,
      username: authState.user?.username,
    });
  }, [authState]);

  // Function to fetch user profile
  const fetchUserProfile = useCallback(async () => {
    try {
      console.log("Fetching user profile...");
      const user = await userApi.getProfile();
      console.log("User profile fetched:", user);

      // Store user in memory
      memoryUser = user;

      // Update auth state with user data
      setAuthState((prev) => ({
        ...prev,
        user,
      }));

      // Update React Query cache
      queryClient.setQueryData(["user-profile"], user);

      return user;
    } catch (error) {
      console.error("Failed to fetch user profile:", error);
      throw error;
    }
  }, [queryClient]);

  const login = useCallback(
    async (username: string, password: string) => {
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

        // Update auth state with token
        setAuthState({
          isAuthenticated: true,
          token: response.access_token,
          user: null, // Will be fetched next
        });

        // Fetch user profile after successful login
        try {
          await fetchUserProfile();
        } catch (profileError) {
          console.error(
            "Failed to fetch user profile after login:",
            profileError
          );
          // Don't fail the login if profile fetch fails
        }

        console.log("Login successful, auth state updated");
        return { success: true };
      } catch (error) {
        console.error("Login failed:", error);
        // Clear any partial state
        memoryToken = null;
        memoryUser = null;
        sessionStorage.removeItem("auth_token");
        setAuthToken(null);
        setAuthState({
          isAuthenticated: false,
          token: null,
          user: null,
        });
        return { success: false, error };
      }
    },
    [fetchUserProfile]
  );

  const logout = useCallback(() => {
    console.log("Logging out...");
    // Clear token and user from memory and sessionStorage
    memoryToken = null;
    memoryUser = null;
    sessionStorage.removeItem("auth_token");
    setAuthToken(null);

    // Clear React Query cache
    queryClient.clear();

    // Update auth state
    setAuthState({
      isAuthenticated: false,
      token: null,
      user: null,
    });
    console.log("Logout complete");
  }, [queryClient]);

  // Sync state with memory token
  useEffect(() => {
    if (memoryToken && !authState.isAuthenticated) {
      console.log("Syncing auth state with memory token");
      setAuthState({
        isAuthenticated: true,
        token: memoryToken,
        user: memoryUser,
      });
    }
  }, [authState.isAuthenticated]);

  // Fetch user profile on mount if authenticated but no user data
  useEffect(() => {
    if (authState.isAuthenticated && !authState.user && memoryToken) {
      console.log("Fetching user profile on mount...");
      fetchUserProfile().catch((error) => {
        console.error("Failed to fetch user profile on mount:", error);
      });
    }
  }, [authState.isAuthenticated, authState.user, fetchUserProfile]);

  return {
    isAuthenticated: authState.isAuthenticated,
    token: authState.token,
    user: authState.user,
    login,
    logout,
    fetchUserProfile,
  };
}
