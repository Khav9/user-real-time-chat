import type React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Gift, Sticker, Smile } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useSendMessage } from "@/hooks/use-messages";
import EmojiPicker from "emoji-picker-react";

interface MessageInputProps {
  channelId: string | null;
  channelName: string;
  initialValue?: string;
  onValueChange?: (value: string) => void;
  isEditing?: boolean;
  onCancelEdit?: () => void;
  onUpdateMessage?: (content: string) => Promise<void>;
}

export function MessageInput({
  channelId,
  channelName,
  initialValue = "",
  onValueChange,
  isEditing = false,
  onCancelEdit,
  onUpdateMessage,
}: MessageInputProps) {
  const [message, setMessage] = useState(initialValue);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const sendMessageMutation = useSendMessage();
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  // Update local state when initialValue changes
  useEffect(() => {
    setMessage(initialValue);
  }, [initialValue]);

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target as Node)
      ) {
        setShowEmojiPicker(false);
      }
    };

    if (showEmojiPicker) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showEmojiPicker]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !channelId) return;

    if (isEditing && onUpdateMessage) {
      await onUpdateMessage(message.trim());
    } else {
      sendMessageMutation.mutate({
        channelId,
        content: message.trim(),
      });
    }

    setMessage("");
    onValueChange?.("");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setMessage(newValue);
    onValueChange?.(newValue);
  };

  const handleEmojiClick = (emoji: any) => {
    setMessage(message + emoji.emoji);
    onValueChange?.(message + emoji.emoji);
  };

  const toggleEmojiPicker = () => {
    setShowEmojiPicker(!showEmojiPicker);
  };

  return (
    <div className="p-4">
      <form onSubmit={handleSubmit} className="relative">
        <div className="flex items-center bg-gray-600 rounded-lg">
          {!isEditing && (
            <Button
              type="button"
              size="sm"
              className="text-gray-400 hover:text-black ml-2 bg-transparent hover:bg-transparent cursor-pointer"
            >
              <Plus className="w-5 h-5" />
            </Button>
          )}
          <Input
            value={message}
            onChange={handleChange}
            placeholder={
              isEditing ? "Edit message..." : `Message #${channelName}`
            }
            className="flex-1 bg-transparent border-none text-white placeholder-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0"
            disabled={sendMessageMutation.isPending}
          />
          <div className="flex items-center gap-1 mr-2">
            <>
              {isEditing && (
                <Button
                  type="button"
                  size="sm"
                  className="text-gray-400 hover:text-white bg-transparent hover:bg-transparent cursor-pointer"
                  onClick={onCancelEdit}
                >
                  Cancel
                </Button>
              )}
              <div className="relative" ref={emojiPickerRef}>
                <Button
                  type="button"
                  size="sm"
                  className={`text-gray-400 hover:text-white bg-transparent hover:bg-transparent cursor-pointer transition-colors duration-200 ${
                    showEmojiPicker ? "text-white" : ""
                  }`}
                  onClick={toggleEmojiPicker}
                >
                  <Smile className="w-5 h-5" />
                </Button>
                {showEmojiPicker && (
                  <div className="absolute bottom-full right-0 mb-2 z-50 transition-all duration-300 ease-in-out transform opacity-100 scale-100">
                    <div className="bg-white rounded-lg shadow-lg border border-gray-200">
                      <EmojiPicker
                        onEmojiClick={handleEmojiClick}
                        width={350}
                        height={400}
                      />
                    </div>
                  </div>
                )}
              </div>
              <Button
                type="button"
                size="sm"
                className="text-gray-400 hover:text-white bg-transparent hover:bg-transparent cursor-pointer"
              >
                <Gift className="w-5 h-5" />
              </Button>
              <Button
                type="button"
                size="sm"
                className="text-gray-400 hover:text-white bg-transparent hover:bg-transparent cursor-pointer"
              >
                <Sticker className="w-5 h-5" />
              </Button>
            </>
          </div>
        </div>
      </form>
    </div>
  );
}
