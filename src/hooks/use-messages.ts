
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Message } from "@/api/api";
import { messagesApi } from "@/api/api";

// Mock API functions - replace with your actual API calls
const fetchMessages = async (channelId: string): Promise<Message[]> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  return [];
};

const sendMessage = async (data: {
  channelId: string;
  content: string;
}): Promise<Message> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 200));

  // Mock response
  return {
    id: Date.now().toString(),
    content: data.content,
    author: {
      id: "current-user",
      username: "me",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    timestamp: new Date().toISOString(),
    channelId: data.channelId,
  };
};

export function useMessages(channelId: string | null) {
  return useQuery({
    queryKey: ["messages", channelId],
    queryFn: async () => {
      if (!channelId) {
        console.log("No channelId provided, returning empty array");
        return Promise.resolve([]);
      }
      console.log("Fetching messages for channel:", channelId);
      const messages = await messagesApi.getByChannel(channelId);
      console.log("Received messages:", messages);
      return messages;
    },
    enabled: !!channelId,
    staleTime: 1000 * 30, // 30 seconds
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { channelId: string; content: string }) =>
      messagesApi.send(data),
    onSuccess: (_, variables) => {
      console.log("Message sent successfully, invalidating queries");
      // Invalidate and refetch messages for this channel
      queryClient.invalidateQueries({
        queryKey: ["messages", variables.channelId],
      });
    },
  });
}

export function useDeleteMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (messageId: string) => messagesApi.delete(messageId),
    onSuccess: () => {
      console.log("Message deleted successfully, invalidating queries");
      // Invalidate all message queries since we don't know which channel the message was in
      queryClient.invalidateQueries({ queryKey: ["messages"] });
    },
  });
}
