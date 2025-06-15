import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Hash, Search, Bell, Pin, Users } from "lucide-react";
import { useMessages } from "@/hooks/use-messages";
import { useChannel } from "@/hooks/use-channels";
import { MessageInput } from "@/components/message-input";
import { format } from "date-fns";
import { MobileNav } from "@/components/mobile-nav";
import { useEffect, useRef } from "react";

interface ChatAreaProps {
  channelId: string | null;
  serverId: string | null;
  onChannelSelect?: (channelId: string) => void;
  onServerSelect?: (serverId: string) => void;
}

export function ChatArea({
  channelId,
  serverId,
  onChannelSelect,
  onServerSelect,
}: ChatAreaProps) {
  const { data: channel } = useChannel(channelId, serverId);
  const { data: messages, isLoading } = useMessages(channelId);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex-1 flex flex-col bg-gray-700">
      {/* Header */}
      <div className="h-12 border-b border-gray-600 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          {serverId && onChannelSelect && onServerSelect && (
            <MobileNav
              serverId={serverId}
              selectedChannel={channelId || "general"}
              onChannelSelect={onChannelSelect}
              onServerSelect={onServerSelect}
            />
          )}
          <Hash className="w-5 h-5 text-gray-400" />
          <span className="text-white font-semibold">
            {channel?.name || "Loading..."}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-white"
          >
            <Hash className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-white"
          >
            <Bell className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-white"
          >
            <Pin className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-white"
          >
            <Users className="w-4 h-4" />
          </Button>
          <div className="relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search"
              className="w-36 bg-gray-900 border-none text-white placeholder-gray-400 pl-8"
            />
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4">
        {/* Welcome Message */}
        <div className="mb-8">
          <div className="w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center mb-4">
            <Hash className="w-8 h-8 text-gray-400" />
          </div>
          <h2 className="text-white text-2xl font-bold mb-2">
            Welcome to #{channel?.name || "Loading..."}!
          </h2>
          <p className="text-gray-400">
            This is the start of the #{channel?.name || "Loading..."} channel.
          </p>
          <Button
            variant="link"
            className="text-blue-400 hover:text-blue-300 p-0 h-auto mt-2"
          >
            ✏️ Edit Channel
          </Button>
        </div>

        {/* Messages */}
        {isLoading ? (
          <div className="text-gray-400">Loading messages...</div>
        ) : messages && messages.length > 0 ? (
          <>
            {messages.map((message) => (
              <div
                key={`${message.created_at}-${message.user.username}`}
                className="flex gap-3 mb-4 hover:bg-gray-800/50 p-2 rounded"
              >
                <Avatar className="w-10 h-10">
                  <AvatarFallback className="bg-indigo-600 text-white">
                    {message.user.username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-white font-medium">
                      {message.user.username}
                    </span>
                    <span className="text-gray-400 text-xs">
                      {format(
                        new Date(message.created_at),
                        "MMM d, yyyy h:mm a"
                      )}
                    </span>
                  </div>
                  <p className="text-gray-300">{message.content}</p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </>
        ) : (
          <div className="text-gray-400">No messages yet</div>
        )}
      </ScrollArea>

      {/* Message Input */}
      {channelId && channel && (
        <MessageInput channelId={channelId} channelName={channel.name} />
      )}
    </div>
  );
}
