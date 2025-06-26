import { Sidebar } from "@/components/sidebar";
import { ChatArea } from "@/components/chat-area";
import { useState, useEffect } from "react";
import { ServerList } from "@/components/server-list";
import { useChannels } from "@/hooks/use-channels";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";

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
  const { serverId, channelId, messageId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [selectedServer, setSelectedServer] = useState<string | null>(
    serverId || null
  );
  const [selectedChannel, setSelectedChannel] = useState<string | null>(
    channelId || null
  );
  const { data: channels } = useChannels(selectedServer);

  // Get message ID from URL params or search params (for DM links)
  const targetMessageId = messageId || searchParams.get("message");

  // Handle URL parameters
  useEffect(() => {
    if (serverId && serverId !== selectedServer) {
      setSelectedServer(serverId);
    }
    if (channelId && channelId !== selectedChannel) {
      setSelectedChannel(channelId);
    }
  }, [serverId, channelId, selectedServer, selectedChannel]);

  // Auto-select DM when app first loads and no URL params
  useEffect(() => {
    if (!selectedServer && !serverId) {
      setSelectedServer("dm");
      navigate("/");
    }
  }, [selectedServer, serverId, navigate]);

  // Auto-select first channel when server changes and no channel is selected
  useEffect(() => {
    if (
      selectedServer &&
      selectedServer !== "dm" &&
      channels &&
      channels.length > 0 &&
      !selectedChannel
    ) {
      const firstChannel = channels[0].channel_id;
      setSelectedChannel(firstChannel);
      navigate(`/servers/${selectedServer}/channels/${firstChannel}`);
    }
  }, [selectedServer, channels, selectedChannel, navigate]);

  // Update URL when server or channel changes
  const handleServerSelect = (serverId: string) => {
    setSelectedServer(serverId);
    setSelectedChannel(null);
    if (serverId === "dm") {
      navigate("/");
    } else {
      navigate(`/servers/${serverId}`);
    }
  };

  const handleChannelSelect = (channelId: string) => {
    setSelectedChannel(channelId);
    if (selectedServer === "dm") {
      navigate("/");
    } else {
      navigate(`/servers/${selectedServer}/channels/${channelId}`);
    }
  };

  return (
    <div className="flex h-full">
      <ServerList
        selectedServer={selectedServer}
        onServerSelect={handleServerSelect}
      />
      <div className="flex flex-1">
        <Sidebar
          serverId={selectedServer}
          selectedChannel={selectedChannel}
          onChannelSelect={handleChannelSelect}
        />
        <ChatArea
          channelId={selectedChannel}
          serverId={selectedServer}
          onChannelSelect={handleChannelSelect}
          onServerSelect={handleServerSelect}
          messageId={targetMessageId}
        />
      </div>
    </div>
  );
}
