import { Sidebar } from "@/components/sidebar";
import { ChatArea } from "@/components/chat-area";
import { useState, useEffect } from "react";
import { ServerList } from "@/components/server-list";
import { useChannels } from "@/hooks/use-channels";

export interface Channel {
  id: string;
  name: string;
  type: "text" | "voice";
  category?: string;
}

export interface Message {
  id: string;
  content: string;
  author: {
    id: string;
    username: string;
    avatar?: string;
  };
  timestamp: string;
  channelId: string;
}

export interface Server {
  id: string;
  name: string;
  icon?: string;
  acronym: string;
}

export function ChatApp() {
  const [selectedServer, setSelectedServer] = useState<string | null>(null);
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);
  const { data: channels } = useChannels(selectedServer);

  // Auto-select DM when app first loads
  useEffect(() => {
    if (!selectedServer) {
      setSelectedServer("dm");
    }
  }, []);

  // Auto-select first channel when server changes
  useEffect(() => {
    if (
      selectedServer &&
      selectedServer !== "dm" &&
      channels &&
      channels.length > 0
    ) {
      setSelectedChannel(channels[0].channel_id);
    }
  }, [selectedServer, channels]);

  return (
    <div className="flex h-full">
      <ServerList
        selectedServer={selectedServer}
        onServerSelect={setSelectedServer}
      />
      <div className="flex flex-1">
        <Sidebar
          serverId={selectedServer}
          selectedChannel={selectedChannel}
          onChannelSelect={setSelectedChannel}
        />
        <ChatArea
          channelId={selectedChannel}
          serverId={selectedServer}
          onChannelSelect={setSelectedChannel}
          onServerSelect={setSelectedServer}
        />
      </div>
    </div>
  );
}
