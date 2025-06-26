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
  Copy,
  Link,
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
import { useAuth } from "@/modules/auth/hook/useAuth";
import { useNavigate } from "react-router-dom";
import { parseMessageLinks } from "@/lib/utils";
import type { MessageLink, ExternalLink } from "@/lib/utils";

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
// import { toast } from "sonner";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface ChatAreaProps {
  channelId: string | null;
  serverId: string | null;
  messageId?: string | null;
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
  messageId,
  onChannelSelect,
  onServerSelect,
}: ChatAreaProps) {
  const { data: channel } = useChannel(channelId, serverId);
  const { data: messages, isLoading } = useMessages(channelId);
  const editMessageMutation = useEditMessage();
  const deleteMessageMutation = useDeleteMessage();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const targetMessageRef = useRef<HTMLDivElement>(null);
  const [reactions, setReactions] = useState<MessageReactions>({});
  const [messageInput, setMessageInput] = useState("");
  const [editingMessage, setEditingMessage] = useState<EditingMessage | null>(
    null
  );
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();

  const emojis = ["👍", "❤️", "😂", "😮", "😢", "😡"];

  const handleEmojiClick = (messageId: string, emoji: string) => {
    setReactions((prev) => {
      const messageReactions = prev[messageId] || [];
      const existingReaction = messageReactions.find((r) => r.emoji === emoji);

      // First, remove any existing reaction from this user
      const updatedReactions = messageReactions
        .map((reaction) => ({
          ...reaction,
          count: reaction.users.includes(currentUser?.username || "")
            ? reaction.count - 1
            : reaction.count,
          users: reaction.users.filter((id) => id !== currentUser?.username),
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
                  users: [...r.users, currentUser?.username || ""],
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
              users: [currentUser?.username || ""],
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

  //copy message
  const handleCopyMessage = (message: string) => {
    navigator.clipboard.writeText(message);
    // toast.success("Message copied successfully");
  };

  //copy message link
  const handleCopyMessageLink = (messageId: string) => {
    const baseUrl = window.location.origin;
    let messageUrl: string;

    if (serverId === "dm") {
      // For DM messages, use the root path with message search parameter
      messageUrl = `${baseUrl}/?message=${messageId}`;
    } else {
      // For server messages, include server and channel in the URL
      messageUrl = `${baseUrl}/servers/${serverId}/channels/${channelId}/messages/${messageId}`;
    }

    navigator.clipboard.writeText(messageUrl);
    // toast.success("Message link copied successfully");
  };

  // Handle message link clicks
  const handleMessageLinkClick = (link: MessageLink) => {
    // Navigate to the message with the message ID in the URL
    navigate(
      `/servers/${link.serverId}/channels/${link.channelId}/messages/${link.messageId}`
    );
  };

  // Handle external link clicks
  const handleExternalLinkClick = (link: ExternalLink) => {
    // Open external links in a new tab
    window.open(link.url, "_blank", "noopener,noreferrer");
  };

  // Handle any link click
  const handleLinkClick = (link: MessageLink | ExternalLink) => {
    if (link.type === "message") {
      handleMessageLinkClick(link);
    } else {
      handleExternalLinkClick(link);
    }
  };

  // Render message content with clickable links
  const renderMessageWithLinks = (content: string) => {
    const parsed = parseMessageLinks(content);

    if (parsed.links.length === 0) {
      return content;
    }

    const result: React.ReactNode[] = [];
    let lastIndex = 0;

    parsed.links.forEach((linkInfo, index) => {
      // Add text before the link
      if (linkInfo.start > lastIndex) {
        result.push(content.slice(lastIndex, linkInfo.start));
      }

      // Add the clickable link
      const linkText =
        linkInfo.link.type === "message"
          ? linkInfo.link.fullUrl
          : linkInfo.link.url;

      result.push(
        <button
          key={`link-${index}`}
          onClick={() => handleLinkClick(linkInfo.link)}
          className="text-blue-400 hover:underline cursor-pointer"
        >
          {linkText}
        </button>
      );

      lastIndex = linkInfo.end;
    });

    // Add remaining text after the last link
    if (lastIndex < content.length) {
      result.push(content.slice(lastIndex));
    }

    return result;
  };

  // Group messages by date
  const groupMessagesByDate = (messages: any[]) => {
    const groups: { [key: string]: any[] } = {};

    messages.forEach((message) => {
      const date = new Date(message.created_at);
      const dateKey = format(date, "yyyy-MM-dd");

      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(message);
    });

    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
  };

  // Format date for display
  const formatDateForDisplay = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (format(date, "yyyy-MM-dd") === format(today, "yyyy-MM-dd")) {
      return "Today";
    } else if (format(date, "yyyy-MM-dd") === format(yesterday, "yyyy-MM-dd")) {
      return "Yesterday";
    } else {
      return format(date, "EEEE, MMMM d, yyyy");
    }
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Scroll to target message when messageId is provided
  useEffect(() => {
    if (messageId && messages && messages.length > 0) {
      const targetMessage = messages.find(
        (msg) => msg.message_id === messageId
      );
      if (targetMessage && targetMessageRef.current) {
        setTimeout(() => {
          targetMessageRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }, 100);

        // Remove highlight and update URL after 3 seconds
        const timeoutId = setTimeout(() => {
          // Update URL to remove message ID
          if (serverId === "dm") {
            navigate("/", { replace: true });
          } else {
            navigate(`/servers/${serverId}/channels/${channelId}`, {
              replace: true,
            });
          }
        }, 3000);

        // Cleanup timeout on unmount or when messageId changes
        return () => clearTimeout(timeoutId);
      }
    }
  }, [messageId, messages, serverId, channelId, navigate]);

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
            {groupMessagesByDate(messages).map(([dateKey, dateMessages]) => (
              <div key={dateKey}>
                {/* Date Separator */}
                <div className="relative flex items-center justify-center my-1">
                  <hr className="border-gray-600 flex-1" />
                  <span className="px-4 text-gray-400 text-sm font-medium bg-gray-700">
                    {formatDateForDisplay(dateKey)}
                  </span>
                  <hr className="border-gray-600 flex-1" />
                </div>

                {/* Messages for this date */}
                {dateMessages.map((message) => (
                  <ContextMenu
                    key={`${message.created_at}-${message.user.username}`}
                  >
                    <ContextMenuTrigger>
                      <div
                        ref={
                          message.message_id === messageId
                            ? targetMessageRef
                            : null
                        }
                        className={`flex gap-3 mb-0 hover:bg-gray-800 p-2 rounded group transition-all duration-300 ${
                          message.message_id === messageId
                            ? "bg-blue-900/20 border-l-4 border-blue-500"
                            : ""
                        }`}
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
                              {format(new Date(message.created_at), "h:mm a")}
                            </span>
                            {message.updated_at !== message.created_at && (
                              <span className="text-green-400 text-xs">
                                Edited
                              </span>
                            )}
                          </div>
                          <p className="text-gray-300">
                            {renderMessageWithLinks(message.content)}
                          </p>
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
                              <PopoverContent
                                className="w-auto p-2"
                                align="start"
                              >
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
                                    reaction.users.includes(
                                      currentUser?.username || ""
                                    )
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
                        {currentUser &&
                          message.user.username === currentUser.username && (
                            <ContextMenuItem
                              inset
                              className="cursor-pointer"
                              onClick={() =>
                                handleEditClick(
                                  message.message_id,
                                  message.content
                                )
                              }
                            >
                              Edit
                              <ContextMenuShortcut>
                                <Pencil className="w-4 h-4" />
                              </ContextMenuShortcut>
                            </ContextMenuItem>
                          )}
                        {currentUser &&
                          message.user.username === currentUser.username && (
                            <ContextMenuItem
                              inset
                              className="cursor-pointer"
                              onClick={() =>
                                handleDeleteMessage(message.message_id)
                              }
                            >
                              <span className="text-red-500/50 group-hover:text-red-500">
                                Delete
                              </span>
                              <ContextMenuShortcut className="text-red-500/50 hover:text-red-500">
                                <Trash className="w-4 h-4" />
                              </ContextMenuShortcut>
                            </ContextMenuItem>
                          )}
                        <ContextMenuItem inset className="cursor-pointer">
                          Save
                          <ContextMenuShortcut>
                            <Bookmark className="w-4 h-4" />
                          </ContextMenuShortcut>
                        </ContextMenuItem>
                        <ContextMenuItem
                          inset
                          className="cursor-pointer"
                          onClick={() => handleCopyMessage(message.content)}
                        >
                          Copy Text
                          <ContextMenuShortcut>
                            <Copy className="w-4 h-4" />
                          </ContextMenuShortcut>
                        </ContextMenuItem>
                        <ContextMenuItem inset className="cursor-pointer">
                          Pin
                          <ContextMenuShortcut>
                            <Pin className="w-4 h-4" />
                          </ContextMenuShortcut>
                        </ContextMenuItem>
                        <ContextMenuItem
                          inset
                          className="cursor-pointer"
                          onClick={() =>
                            handleCopyMessageLink(message.message_id)
                          }
                        >
                          Copy Message Link
                          <ContextMenuShortcut>
                            <Link className="w-4 h-4" />
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
