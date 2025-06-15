"use client";

import { useQuery } from "@tanstack/react-query";
import type { Channel } from "@/api/api";
import { channelsApi } from "@/api/api";
// Removed: export { useServer } from "./use-servers"

// Mock API functions - replace with your actual API calls
const fetchChannels = async (serverId: string): Promise<Channel[]> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Return different channels based on server
  const channelsByServer: Record<string, Channel[]> = {
    web: [
      {
        id: "welcome-and-rules",
        name: "welcome-and-rules",
        type: "text",
        category: "Information",
      },
      {
        id: "notes-resources",
        name: "notes-resources",
        type: "text",
        category: "Information",
      },
      {
        id: "general",
        name: "general",
        type: "text",
        category: "Text Channels",
      },
      {
        id: "homework-help",
        name: "homework-help",
        type: "text",
        category: "Text Channels",
      },
      {
        id: "session-planning",
        name: "session-planning",
        type: "text",
        category: "Text Channels",
      },
      {
        id: "off-topic",
        name: "off-topic",
        type: "text",
        category: "Text Channels",
      },
    ],
    react: [
      {
        id: "announcements",
        name: "announcements",
        type: "text",
        category: "Information",
      },
      { id: "general", name: "general", type: "text", category: "General" },
      { id: "help", name: "help", type: "text", category: "General" },
      { id: "showcase", name: "showcase", type: "text", category: "General" },
    ],
    // Add more servers as needed
  };

  return channelsByServer[serverId] || [];
};

const fetchChannel = async (
  channelId: string,
  serverId?: string
): Promise<Channel | null> => {
  // Get all channels for all servers to find the specific channel
  const allServers = ["web", "react", "nextjs", "tailwind", "typescript"];

  for (const server of allServers) {
    const channels = await fetchChannels(server);
    const channel = channels.find((c) => c.id === channelId);
    if (channel) return channel;
  }

  return null;
};

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
