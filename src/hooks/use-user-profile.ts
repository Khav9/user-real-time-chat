import { useQuery } from "@tanstack/react-query";
import { userApi } from "@/api/api";
import { useAuth } from "@/modules/auth/hook/useAuth";

export function useUserProfile() {
  const { isAuthenticated, user } = useAuth();

  return useQuery({
    queryKey: ["user-profile"],
    queryFn: async () => {
      try {
        const userData = await userApi.getProfile();
        return userData;
      } catch (error) {
        console.error("Error fetching user profile:", error);
        throw error;
      }
    },
    enabled: isAuthenticated && !user, // Only fetch if authenticated but no user data
    retry: false,
    staleTime: 1000 * 60 * 30, // 30 minutes - user profile doesn't change often
    gcTime: 1000 * 60 * 60, // 1 hour
  });
}
