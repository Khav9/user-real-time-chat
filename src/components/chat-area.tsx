import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Hash,
  Search,
  Bell,
  Pin,
  Users,
  SmilePlus,
  Pencil,
  Trash,
  Bookmark,
} from "lucide-react";
import {
  useMessages,
  useEditMessage,
  useDeleteMessage,
} from "@/hooks/use-messages";
import { useChannel } from "@/hooks/use-channels";
import { MessageInput } from "@/components/message-input";
import { format } from "date-fns";
import { MobileNav } from "@/components/mobile-nav";
import { useEffect, useRef, useState } from "react";

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface ChatAreaProps {
  channelId: string | null;
  serverId: string | null;
  onChannelSelect?: (channelId: string) => void;
  onServerSelect?: (serverId: string) => void;
}

interface Reaction {
  emoji: string;
  count: number;
  users: string[]; // Track which users have reacted
}

interface MessageReactions {
  [messageId: string]: Reaction[];
}

interface EditingMessage {
  message_id: string;
  content: string;
}

export function ChatArea({
  channelId,
  serverId,
  onChannelSelect,
  onServerSelect,
}: ChatAreaProps) {
  const { data: channel } = useChannel(channelId, serverId);
  const { data: messages, isLoading } = useMessages(channelId);
  const editMessageMutation = useEditMessage();
  const deleteMessageMutation = useDeleteMessage();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [reactions, setReactions] = useState<MessageReactions>({});
  const [messageInput, setMessageInput] = useState("");
  const [editingMessage, setEditingMessage] = useState<EditingMessage | null>(
    null
  );
  // TODO: Replace with actual user ID from your auth system
  const currentUserId = "current-user-123";

  const emojis = ["👍", "❤️", "😂", "😮", "😢", "😡"];

  const handleEmojiClick = (messageId: string, emoji: string) => {
    setReactions((prev) => {
      const messageReactions = prev[messageId] || [];
      const existingReaction = messageReactions.find((r) => r.emoji === emoji);

      // First, remove any existing reaction from this user
      const updatedReactions = messageReactions
        .map((reaction) => ({
          ...reaction,
          count: reaction.users.includes(currentUserId)
            ? reaction.count - 1
            : reaction.count,
          users: reaction.users.filter((id) => id !== currentUserId),
        }))
        .filter((r) => r.count > 0);

      // Then add the new reaction
      if (existingReaction) {
        // If reaction type exists, add user to it
        return {
          ...prev,
          [messageId]: updatedReactions.map((r) =>
            r.emoji === emoji
              ? {
                  ...r,
                  count: r.count + 1,
                  users: [...r.users, currentUserId],
                }
              : r
          ),
        };
      } else {
        // Add new reaction type
        return {
          ...prev,
          [messageId]: [
            ...updatedReactions,
            {
              emoji,
              count: 1,
              users: [currentUserId],
            },
          ],
        };
      }
    });
  };

  const handleEditClick = (messageId: string, content: string) => {
    setEditingMessage({ message_id: messageId, content });
    setMessageInput(content);
  };

  const handleCancelEdit = () => {
    setEditingMessage(null);
    setMessageInput("");
  };

  const handleUpdateMessage = async (content: string) => {
    if (!editingMessage || !channelId) return;

    try {
      await editMessageMutation.mutateAsync({
        channelId,
        messageId: editingMessage.message_id,
        content,
      });

      setEditingMessage(null);
      setMessageInput("");
    } catch (error) {
      console.error("Failed to update message:", error);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!channelId) return;

    try {
      await deleteMessageMutation.mutateAsync({
        channelId,
        messageId,
      });
    } catch (error) {
      console.error("Failed to delete message:", error);
    }
  };

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
            className="text-gray-400 hover:text-black"
          >
            <Hash className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-black"
          >
            <Bell className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-black"
          >
            <Pin className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-black"
          >
            <Users className="w-4 h-4" />
          </Button>
          <div className="relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search"
              className="w-36 bg-gray-900 border-none text-white pl-8 placeholder-gray-400"
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
              <ContextMenu
                key={`${message.created_at}-${message.user.username}`}
              >
                <ContextMenuTrigger>
                  <div className="flex gap-3 mb-0 hover:bg-gray-800/50 p-2 rounded group">
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
                        {message.updated_at !== message.created_at && (
                          <span className="text-green-400 text-xs">Edited</span>
                        )}
                      </div>
                      <p className="text-gray-300">{message.content}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Popover>
                          <PopoverTrigger asChild>
                            <SmilePlus
                              className={`w-4 h-4 text-gray-400 hover:text-white cursor-pointer transition-opacity duration-200 ${
                                reactions[
                                  `${message.created_at}-${message.user.username}`
                                ]?.length > 0
                                  ? "opacity-100"
                                  : "opacity-0 group-hover:opacity-100"
                              }`}
                            />
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-2" align="start">
                            <div className="flex gap-2">
                              {emojis.map((emoji) => (
                                <button
                                  key={emoji}
                                  onClick={() =>
                                    handleEmojiClick(
                                      `${message.created_at}-${message.user.username}`,
                                      emoji
                                    )
                                  }
                                  className="hover:bg-gray-100 dark:hover:bg-gray-800 p-1 rounded transition-colors"
                                >
                                  {emoji}
                                </button>
                              ))}
                            </div>
                          </PopoverContent>
                        </Popover>
                        {/* Display reactions */}
                        <div className="flex gap-1">
                          {reactions[
                            `${message.created_at}-${message.user.username}`
                          ]?.map((reaction) => (
                            <button
                              key={reaction.emoji}
                              onClick={() =>
                                handleEmojiClick(
                                  `${message.created_at}-${message.user.username}`,
                                  reaction.emoji
                                )
                              }
                              className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-sm transition-colors ${
                                reaction.users.includes(currentUserId)
                                  ? "bg-gray-100 hover:bg-gray-200"
                                  : "bg-gray-800/50 hover:bg-gray-800"
                              }`}
                            >
                              <span>{reaction.emoji}</span>
                              <span className="text-gray-600">
                                {reaction.count}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Context Menu */}
                  <ContextMenuContent className="w-52">
                    <ContextMenuItem
                      inset
                      className="cursor-pointer"
                      onClick={() =>
                        handleEditClick(message.message_id, message.content)
                      }
                    >
                      Edit
                      <ContextMenuShortcut>
                        <Pencil className="w-4 h-4" />
                      </ContextMenuShortcut>
                    </ContextMenuItem>
                    <ContextMenuItem
                      inset
                      className="cursor-pointer"
                      onClick={() => handleDeleteMessage(message.message_id)}
                    >
                      <span className="text-red-500/50 group-hover:text-red-500">
                        Delete
                      </span>
                      <ContextMenuShortcut className="text-red-500/50 hover:text-red-500">
                        <Trash className="w-4 h-4" />
                      </ContextMenuShortcut>
                    </ContextMenuItem>
                    <ContextMenuItem inset className="cursor-pointer">
                      Save
                      <ContextMenuShortcut>
                        <Bookmark className="w-4 h-4" />
                      </ContextMenuShortcut>
                    </ContextMenuItem>
                    <ContextMenuSub>
                      <ContextMenuSubTrigger inset>
                        Reaction by
                      </ContextMenuSubTrigger>
                      <ContextMenuSubContent className="w-44">
                        <ContextMenuItem className="flex items-center gap-1">
                          <Avatar className="w-4 h-4">
                            <AvatarFallback className="bg-indigo-600 text-white">
                              N
                            </AvatarFallback>
                          </Avatar>
                          <Avatar className="w-4 h-4">
                            <AvatarFallback className="bg-indigo-600 text-white">
                              M
                            </AvatarFallback>
                          </Avatar>
                          <Avatar className="w-4 h-4">
                            <AvatarFallback className="bg-indigo-600 text-white">
                              L
                            </AvatarFallback>
                          </Avatar>
                        </ContextMenuItem>
                      </ContextMenuSubContent>
                    </ContextMenuSub>
                  </ContextMenuContent>
                </ContextMenuTrigger>
              </ContextMenu>
            ))}
            <div ref={messagesEndRef} />
          </>
        ) : (
          <div className="text-gray-400">No messages yet</div>
        )}
      </ScrollArea>

      {/* Message Input */}
      {channelId && channel && (
        <MessageInput
          channelId={channelId}
          channelName={channel.name}
          initialValue={messageInput}
          onValueChange={setMessageInput}
          isEditing={!!editingMessage}
          onCancelEdit={handleCancelEdit}
          onUpdateMessage={handleUpdateMessage}
        />
      )}
    </div>
  );
}
