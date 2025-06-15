import type React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Gift, Sticker, Smile } from "lucide-react";
import { useState } from "react";
import { useSendMessage } from "@/hooks/use-messages";

interface MessageInputProps {
  channelId: string | null;
  channelName: string;
}

export function MessageInput({ channelId, channelName }: MessageInputProps) {
  const [message, setMessage] = useState("");
  const sendMessageMutation = useSendMessage();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && channelId) {
      sendMessageMutation.mutate({
        channelId,
        content: message.trim(),
      });
      setMessage("");
    }
  };

  return (
    <div className="p-4">
      <form onSubmit={handleSubmit} className="relative">
        <div className="flex items-center bg-gray-600 rounded-lg">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-white ml-2"
          >
            <Plus className="w-5 h-5" />
          </Button>
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={`Message #${channelName}`}
            className="flex-1 bg-transparent border-none text-white placeholder-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0"
            disabled={sendMessageMutation.isPending}
          />
          <div className="flex items-center gap-1 mr-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white"
            >
              <Gift className="w-5 h-5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white"
            >
              <Sticker className="w-5 h-5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white"
            >
              <Smile className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
