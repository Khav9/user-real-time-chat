import { useQuery } from "@tanstack/react-query";
import { channelsApi } from "@/api/api";

export function useChannels(serverId: string | null) {
  return useQuery({
    queryKey: ["channels", serverId],
    queryFn: () => {
      if (!serverId) {
        return Promise.resolve([]);
      }
      return channelsApi.getByServer(serverId);
    },
    enabled: !!serverId,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

export function useChannel(channelId: string | null, serverId?: string | null) {
  return useQuery({
    queryKey: ["channel", channelId, serverId],
    queryFn: () => {
      if (!channelId) {
        return Promise.resolve(null);
      }
      return channelsApi.getById(channelId);
    },
    enabled: !!channelId,
  });
}
