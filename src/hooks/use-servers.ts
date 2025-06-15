import { useQuery } from "@tanstack/react-query";
import { serversApi } from "@/api/api";
import { useAuth } from "@/modules/auth/hook/useAuth";

export interface Server {
  server_id: string;
  name: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
  image?: string;
}

export interface ServerResponse {
  message: string;
  statusCode: number;
  data: Server;
}

export function useServers() {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ["servers"],
    queryFn: async () => {
      try {
        const response = await serversApi.getMyServers();
        return response.data;
      } catch (error) {
        console.error("Error fetching servers:", error);
        throw error;
      }
    },
    enabled: isAuthenticated,
    retry: false,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

export function useServer(serverId: string) {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ["server", serverId],
    queryFn: async () => {
      const response = await serversApi.getServerDetailsById(serverId);
      return response;
    },
    enabled: !!serverId && isAuthenticated,
    retry: false,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}
