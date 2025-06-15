import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { messagesApi } from "@/api/api";

export interface Message {
  message_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  user: {
    username: string;
  };
}

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

export function useEditMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      channelId: string;
      messageId: string;
      content: string;
    }) => messagesApi.edit(data),
    onSuccess: (_, variables) => {
      console.log("Message updated successfully, invalidating queries");
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
    mutationFn: (data: { channelId: string; messageId: string }) =>
      messagesApi.delete(data),
    onSuccess: (_, variables) => {
      console.log("Message deleted successfully, invalidating queries");
      // Invalidate and refetch messages for this channel
      queryClient.invalidateQueries({
        queryKey: ["messages", variables.channelId],
      });
    },
  });
}
