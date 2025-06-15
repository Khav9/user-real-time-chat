
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, Hash, Volume2, Plus, ChevronDown, ChevronRight } from "lucide-react"
import { useChannels } from "@/hooks/use-channels"
import { useServer } from "@/hooks/use-servers"
import { useServers } from "@/hooks/use-servers"
import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"

interface MobileNavProps {
  serverId: string
  selectedChannel: string
  onChannelSelect: (channelId: string) => void
  onServerSelect: (serverId: string) => void
}

export function MobileNav({ serverId, selectedChannel, onChannelSelect, onServerSelect }: MobileNavProps) {
  const { data: servers } = useServers()
  const { data: server } = useServer(serverId)
  const { data: channels } = useChannels(serverId)
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(["Information", "Text Channels"]))

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(category)) {
      newExpanded.delete(category)
    } else {
      newExpanded.add(category)
    }
    setExpandedCategories(newExpanded)
  }

  const groupedChannels = channels?.reduce(
    (acc, channel) => {
      const category = channel.type || "Text Channels"
      if (!acc[category]) acc[category] = []
      acc[category].push(channel)
      return acc
    },
    {} as Record<string, typeof channels>,
  )

  return (
    <div className="md:hidden">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
            <Menu className="w-5 h-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-80 bg-gray-900 border-gray-700 p-0">
          <div className="flex h-full">
            {/* Server List */}
            <div className="w-18 bg-gray-900 flex flex-col items-center py-3">
              <ScrollArea className="flex-1 w-full">
                <div className="flex flex-col items-center gap-2 px-3">
                  {servers?.map((serverItem) => (
                    <Button
                      key={serverItem.server_id}
                      variant="ghost"
                      className={`w-12 h-12 rounded-full p-0 transition-all duration-200 ${
                        serverId === serverItem.server_id
                          ? "bg-indigo-600 text-white rounded-2xl"
                          : "bg-gray-700 text-gray-300 hover:bg-indigo-600 hover:text-white hover:rounded-2xl"
                      }`}
                      onClick={() => onServerSelect(serverItem.server_id)}
                    >
                      {serverItem.image ? (
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={serverItem.image || "/placeholder.svg"} alt={serverItem.name} />
                          <AvatarFallback className="bg-indigo-600 text-white font-bold">
                            {serverItem.name}
                          </AvatarFallback>
                        </Avatar>
                      ) : (
                        <span className="font-bold text-lg">{serverItem.name}</span>
                      )}
                    </Button>
                  ))}
                </div>
              </ScrollArea>
            </div>

            {/* Channels */}
            <div className="flex-1 bg-gray-800">
              <div className="p-3 border-b border-gray-700">
                <div className="flex items-center justify-between">
                  <h2 className="text-white font-semibold">{server?.name || "Loading..."}</h2>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </div>
              </div>

              <ScrollArea className="flex-1">
                <div className="p-2">
                  {groupedChannels &&
                    Object.entries(groupedChannels).map(([category, categoryChannels]) => (
                      <div key={category} className="mb-4">
                        <Button
                          variant="ghost"
                          onClick={() => toggleCategory(category)}
                          className="w-full justify-start text-gray-400 hover:text-gray-300 p-1 h-auto text-xs font-semibold uppercase tracking-wide"
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
                                onClick={() => {
                                  onChannelSelect(channel.channel_id)
                                }}
                                className={`w-full justify-start text-gray-300 hover:text-white hover:bg-gray-700 p-2 h-auto ${
                                  selectedChannel === channel.channel_id ? "bg-gray-700 text-white" : ""
                                }`}
                              >
                                {channel.type === "text" ? (
                                  <Hash className="w-4 h-4 mr-2" />
                                ) : (
                                  <Volume2 className="w-4 h-4 mr-2" />
                                )}
                                {channel.name}
                              </Button>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              </ScrollArea>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
