"use client";

import { useQuery } from "@tanstack/react-query";
// import type { Channel } from "@/api/api";
import { channelsApi } from "@/api/api";
// Removed: export { useServer } from "./use-servers"

// Mock API functions - replace with your actual API calls
// const fetchChannels = async (serverId: string): Promise<Channel[]> => {
//   // Simulate API delay
//   await new Promise((resolve) => setTimeout(resolve, 500));

//   // Return different channels based on server
//   const channelsByServer: Record<string, Channel[]> = {
//     web: [
//       {
//         channel_id: "welcome-and-rules",
//         server_id: serverId,
//         name: "welcome-and-rules",
//         type: "text",
//         created_at: new Date().toISOString(),
//         updated_at: new Date().toISOString()
//       },
//       {
//         channel_id: "notes-resources",
//         server_id: serverId,
//         name: "notes-resources",
//         type: "text",
//         created_at: new Date().toISOString(),
//         updated_at: new Date().toISOString()
//       },
//       {
//         channel_id: "general",
//         server_id: serverId,
//         name: "general",
//         type: "text",
//         created_at: new Date().toISOString(),
//         updated_at: new Date().toISOString()
//       },
//       {
//         channel_id: "homework-help",
//         server_id: serverId,
//         name: "homework-help",
//         type: "text",
//         created_at: new Date().toISOString(),
//         updated_at: new Date().toISOString()
//       },
//       {
//         channel_id: "session-planning",
//         server_id: serverId,
//         name: "session-planning",
//         type: "text",
//         created_at: new Date().toISOString(),
//         updated_at: new Date().toISOString()
//       },
//       {
//         channel_id: "off-topic",
//         server_id: serverId,
//         name: "off-topic",
//         type: "text",
//         created_at: new Date().toISOString(),
//         updated_at: new Date().toISOString()
//       }
//     ],
//     react: [
//       {
//         channel_id: "announcements",
//         server_id: serverId,
//         name: "announcements",
//         type: "text",
//         created_at: new Date().toISOString(),
//         updated_at: new Date().toISOString()
//       },
//       {
//         channel_id: "general",
//         server_id: serverId,
//         name: "general",
//         type: "text",
//         created_at: new Date().toISOString(),
//         updated_at: new Date().toISOString()
//       },
//       {
//         channel_id: "help",
//         server_id: serverId,
//         name: "help",
//         type: "text",
//         created_at: new Date().toISOString(),
//         updated_at: new Date().toISOString()
//       },
//       {
//         channel_id: "showcase",
//         server_id: serverId,
//         name: "showcase",
//         type: "text",
//         created_at: new Date().toISOString(),
//         updated_at: new Date().toISOString()
//       }
//     ]
//   };

//   return channelsByServer[serverId] || [];
// };

// const fetchChannel = async (
//   channelId: string,
//   serverId?: string
// ): Promise<Channel | null> => {
//   // Get all channels for all servers to find the specific channel
//   const allServers = ["web", "react", "nextjs", "tailwind", "typescript"];

//   for (const server of allServers) {
//     const channels = await fetchChannels(server);
//     const channel = channels.find((c) => c.id === channelId);
//     if (channel) return channel;
//   }

//   return null;
// };

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
