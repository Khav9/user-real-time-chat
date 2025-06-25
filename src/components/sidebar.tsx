import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Hash,
  Volume2,
  Settings,
  Mic,
  Headphones,
  Plus,
  ChevronDown,
  ChevronRight,
  LogOut,
} from "lucide-react";
import { useChannels } from "@/hooks/use-channels";
import { useState } from "react";
import { useServer } from "@/hooks/use-servers";
import { useAuth } from "@/modules/auth/hook/useAuth";
import { useNavigate } from "react-router-dom";

interface SidebarProps {
  serverId: string | null;
  selectedChannel: string | null;
  onChannelSelect: (channelId: string) => void;
}

export function Sidebar({
  serverId,
  selectedChannel,
  onChannelSelect,
}: SidebarProps) {
  const { data: channels } = useChannels(serverId);
  const { data: server } = useServer(serverId || "");
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(["Information", "Text Channels"])
  );

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const groupedChannels = channels?.reduce((acc, channel) => {
    const category = channel.type;
    if (!acc[category]) acc[category] = [];
    acc[category].push(channel);
    return acc;
  }, {} as Record<string, typeof channels>);

  return (
    <div className="w-60 bg-gray-800 flex flex-col h-full md:flex hidden lg:flex">
      {/* Server Header */}
      <div className="p-3 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <h2 className="text-white font-semibold">
            {server?.name || <Skeleton className="h-4 w-40" />}
          </h2>
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2">
          {/* Channel Categories */}
          {groupedChannels &&
            Object.entries(groupedChannels).map(
              ([category, categoryChannels]) => (
                <div key={category} className="mb-4">
                  <Button
                    variant="ghost"
                    onClick={() => toggleCategory(category)}
                    className="w-full justify-start text-gray-400 p-1 h-auto text-xs font-semibold uppercase tracking-wide"
                  >
                    {expandedCategories.has(category) ? (
                      <ChevronDown className="w-3 h-3 mr-1" />
                    ) : (
                      <ChevronRight className="w-3 h-3 mr-1" />
                    )}
                    {category}
                    <Plus className="w-3 h-3 ml-auto" />
                  </Button>

                  {expandedCategories.has(category) && (
                    <div className="ml-2 mt-1">
                      {categoryChannels.map((channel) => (
                        <Button
                          key={channel.channel_id}
                          variant="ghost"
                          onClick={() => onChannelSelect(channel.channel_id)}
                          className={`w-full justify-start text-gray-300 hover:text-white hover:bg-gray-700 p-2 h-auto ${
                            selectedChannel === channel.channel_id
                              ? "bg-gray-700 text-white"
                              : ""
                          }`}
                        >
                          {channel.type === "text" ? (
                            <Hash className="w-4 h-4 mr-2" />
                          ) : (
                            <Volume2 className="w-4 h-4 mr-2" />
                          )}
                          {channel.name}
                          {channel.channel_id === selectedChannel &&
                            channel.type === "text" && (
                              <div className="ml-auto flex gap-1">
                                <Settings className="w-4 h-4" />
                              </div>
                            )}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              )
            )}
        </div>
      </ScrollArea>

      {/* User Area */}
      <div className="p-2 border-t border-gray-700">
        <div className="flex items-center justify-between p-2 rounded">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Avatar className="w-8 h-8">
                <AvatarImage src="/placeholder.svg?height=32&width=32" />
                <AvatarFallback className="bg-indigo-600 text-white text-sm">
                  {user?.username?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-800" />
            </div>
            <div>
              <div className="text-white text-sm font-medium">
                {user?.username || "Loading..."}
              </div>
              <div className="text-gray-400 text-xs">Online</div>
            </div>
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="w-8 h-8 p-0 text-gray-400 hover:text-black"
            >
              <Mic className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-8 h-8 p-0 text-gray-400 hover:text-black"
            >
              <Headphones className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-8 h-8 p-0 text-gray-400 hover:text-black"
            >
              <Settings className="w-4 h-4" />
            </Button>
            <Button 
              variant="destructive" 
              size="sm" 
              className="w-8 h-8 p-0 text-gray-400 hover:text-black"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
