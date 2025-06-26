import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Message link parsing utilities
export interface MessageLink {
  type: "message";
  serverId: string;
  channelId: string;
  messageId: string;
  fullUrl: string;
}

export interface ExternalLink {
  type: "external";
  url: string;
}

export type ParsedLink = MessageLink | ExternalLink;

export interface ParsedMessageContent {
  text: string;
  links: Array<{
    start: number;
    end: number;
    link: ParsedLink;
  }>;
}

export function parseMessageLinks(content: string): ParsedMessageContent {
  const links: Array<{
    start: number;
    end: number;
    link: ParsedLink;
  }> = [];

  // Regex to match message links
  // Matches: http://localhost:5173/servers/1/channels/1/messages/40
  // or: https://domain.com/servers/1/channels/1/messages/40
  const messageLinkRegex =
    /(https?:\/\/[^\s]+?\/servers\/([^\/]+)\/channels\/([^\/]+)\/messages\/([^\/\s]+))/g;

  // Regex to match external URLs (including YouTube, etc.)
  const externalLinkRegex = /(https?:\/\/[^\s]+)/g;

  let match: RegExpExecArray | null = null;

  // First, find message links
  while ((match = messageLinkRegex.exec(content)) !== null) {
    const [fullUrl, , serverId, channelId, messageId] = match;

    links.push({
      start: match.index,
      end: match.index + fullUrl.length,
      link: {
        type: "message",
        serverId,
        channelId,
        messageId,
        fullUrl,
      },
    });
  }

  // Then find external links (excluding message links)
  while ((match = externalLinkRegex.exec(content)) !== null) {
    const fullUrl = match[1];

    // Skip if this URL is already captured as a message link
    const isAlreadyCaptured = links.some(
      (link) =>
        match &&
        link.start <= match.index &&
        link.end >= match.index + fullUrl.length
    );

    if (!isAlreadyCaptured) {
      links.push({
        start: match.index,
        end: match.index + fullUrl.length,
        link: {
          type: "external",
          url: fullUrl,
        },
      });
    }
  }

  // Sort links by start position
  links.sort((a, b) => a.start - b.start);

  return {
    text: content,
    links,
  };
}
