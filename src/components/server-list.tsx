import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Plus, Compass, Download } from "lucide-react";
import { useServers } from "@/hooks/use-servers";

interface ServerListProps {
  selectedServer: string | null;
  onServerSelect: (serverId: string) => void;
}

export function ServerList({
  selectedServer,
  onServerSelect,
}: ServerListProps) {
  const { data: servers, isLoading, error } = useServers();

  // Function to get server acronym
  const getServerAcronym = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="w-18 bg-gray-900 flex flex-col items-center py-3 hidden md:flex">
      <TooltipProvider>
        <ScrollArea className="flex-1 w-full">
          <div className="flex flex-col items-center gap-2 px-3">
            {/* Direct Messages */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  className={`w-12 h-12 rounded-full p-0 transition-all duration-200 ${
                    selectedServer === "dm"
                      ? "bg-indigo-600 text-white rounded-2xl"
                      : "bg-gray-700 text-gray-300 hover:bg-indigo-600 hover:text-white hover:rounded-2xl"
                  }`}
                  onClick={() => onServerSelect("dm")}
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">DM</span>
                  </div>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>Direct Messages</p>
              </TooltipContent>
            </Tooltip>

            {/* Separator */}
            <div className="w-8 h-0.5 bg-gray-600 rounded-full my-1" />

            {/* Loading State */}
            {isLoading && (
              <div className="w-12 h-12 rounded-full bg-gray-700 animate-pulse" />
            )}

            {/* Error State */}
            {error && (
              <div className="text-red-500 text-sm">Failed to load servers</div>
            )}

            {/* Server List */}
            {!isLoading &&
              !error &&
              servers?.map((server) => (
                <Tooltip key={server.server_id}>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      className={`w-12 h-12 rounded-full p-0 transition-all duration-200 relative group ${
                        selectedServer === server.server_id
                          ? "bg-indigo-600 text-white rounded-2xl"
                          : "bg-gray-700 text-gray-300 hover:bg-indigo-600 hover:text-white hover:rounded-2xl"
                      }`}
                      onClick={() => onServerSelect(server.server_id)}
                    >
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="font-bold text-lg">
                          {getServerAcronym(server.name)}
                        </span>
                      </div>

                      {/* Active indicator */}
                      {selectedServer === server.server_id && (
                        <div className="absolute -left-1 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-white rounded-r-full" />
                      )}

                      {/* Hover indicator */}
                      {selectedServer !== server.server_id && (
                        <div className="absolute -left-1 top-1/2 transform -translate-y-1/2 w-1 h-2 bg-white rounded-r-full opacity-0 group-hover:opacity-100 group-hover:h-5 transition-all duration-200" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>{server.name}</p>
                  </TooltipContent>
                </Tooltip>
              ))}

            {/* Add Server */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-12 h-12 rounded-full p-0 bg-gray-700 text-green-400 hover:bg-green-600 hover:text-white hover:rounded-2xl transition-all duration-200"
                >
                  <Plus className="w-6 h-6" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>Add a Server</p>
              </TooltipContent>
            </Tooltip>

            {/* Discover */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-12 h-12 rounded-full p-0 bg-gray-700 text-green-400 hover:bg-green-600 hover:text-white hover:rounded-2xl transition-all duration-200"
                >
                  <Compass className="w-6 h-6" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>Explore Public Servers</p>
              </TooltipContent>
            </Tooltip>

            {/* Separator */}
            <div className="w-8 h-0.5 bg-gray-600 rounded-full my-1" />

            {/* Download Apps */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-12 h-12 rounded-full p-0 bg-gray-700 text-green-400 hover:bg-green-600 hover:text-white hover:rounded-2xl transition-all duration-200"
                >
                  <Download className="w-6 h-6" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>Download Apps</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </ScrollArea>
      </TooltipProvider>
    </div>
  );
}
