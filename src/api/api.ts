// API Configuration and Best Practices

export const API_BASE_URL =
  import.meta.env.PUBLIC_API_URL || "http://localhost:3001";
// import.meta.env.PUBLIC_API_URL || "https://real-time-chat-ptfl.onrender.com";

// Store token in memory
let memoryToken: string | null = null;

// Function to set the token
export const setAuthToken = (token: string | null) => {
  console.log("Setting auth token:", token ? "Token present" : "No token");
  memoryToken = token;
};

// API Client with error handling and interceptors
class ApiClient {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.defaultHeaders = {
      "Content-Type": "application/json",
    };
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    const config: RequestInit = {
      headers: {
        ...this.defaultHeaders,
        ...options.headers,
      },
      ...options,
    };

    // Add auth token if available
    if (memoryToken) {
      console.log("Adding auth token to request:", endpoint);
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${memoryToken}`,
      };
    } else {
      console.log("No auth token available for request:", endpoint);
    }

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        if (response.status === 401) {
          // Clear token on unauthorized
          setAuthToken(null);
          window.location.href = "/login";
          return Promise.reject(new Error("Unauthorized"));
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("API request failed:", error);
      throw error;
    }
  }

  // HTTP Methods
  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "GET" });
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "DELETE" });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);

// Specific API functions
export const channelsApi = {
  getAll: () => apiClient.get<Channel[]>("/channels"),
  getById: (id: string) =>
    apiClient.get<Channel>(`/servers/${id}/channels/${id}`),
  getByServer: (serverId: string) =>
    apiClient.get<Channel[]>(`/servers/${serverId}/channels`),
  create: (data: Omit<Channel, "channel_id" | "created_at" | "updated_at">) =>
    apiClient.post<Channel>("/channels", data),
  update: (id: string, data: Partial<Channel>) =>
    apiClient.put<Channel>(`/channels/${id}`, data),
  delete: (id: string) => apiClient.delete(`/channels/${id}`),
};

export interface Message {
  message_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  user: {
    username: string;
  };
}

export const messagesApi = {
  getByChannel: (channelId: string) =>
    apiClient.get<Message[]>(`/channels/${channelId}/messages`),
  getById: (messageId: string) =>
    apiClient.get<Message>(`/messages/${messageId}`),
  send: (data: { channelId: string; content: string }) =>
    apiClient.post<Message>(`/channels/${data.channelId}/messages`, {
      content: data.content,
    }),
  edit: (data: { channelId: string; messageId: string; content: string }) =>
    apiClient.put<Message>(
      `/channels/${data.channelId}/messages/${data.messageId}`,
      {
        content: data.content,
      }
    ),
  delete: (data: { channelId: string; messageId: string }) =>
    apiClient.delete(`/channels/${data.channelId}/messages/${data.messageId}`),
};

// WebSocket connection for real-time updates
export class WebSocketManager {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  connect(url: string, onMessage: (data: any) => void) {
    try {
      this.ws = new WebSocket(url);

      this.ws.onopen = () => {
        console.log("WebSocket connected");
        this.reconnectAttempts = 0;
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          onMessage(data);
        } catch (error) {
          console.error("Failed to parse WebSocket message:", error);
        }
      };

      this.ws.onclose = () => {
        console.log("WebSocket disconnected");
        this.reconnect(url, onMessage);
      };

      this.ws.onerror = (error) => {
        console.error("WebSocket error:", error);
      };
    } catch (error) {
      console.error("Failed to connect WebSocket:", error);
    }
  }

  private reconnect(url: string, onMessage: (data: any) => void) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => {
        console.log(
          `Reconnecting WebSocket (attempt ${this.reconnectAttempts})`
        );
        this.connect(url, onMessage);
      }, this.reconnectDelay * this.reconnectAttempts);
    }
  }

  send(data: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

// Types
export interface Channel {
  channel_id: string;
  server_id: string;
  name: string;
  type: "text" | "voice";
  created_at: string;
  updated_at: string;
}

export interface User {
  user_id: string;
  username: string;
  email: string;
  created_at: string;
  updated_at: string;
}

interface Server {
  server_id: string;
  name: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
  image?: string;
}

interface ServerResponse {
  message: string;
  statusCode: number;
  data: Server[];
}

export const serversApi = {
  getMyServers: () => {
    if (!memoryToken) {
      throw new Error("Authentication required to fetch servers");
    }
    return apiClient.get<ServerResponse>("/servers/my-servers");
  },
  getServerDetailsById: (id: string) => {
    return apiClient.get<Server>(`/servers/${id}`);
  },
  create: (data: Omit<Server, "server_id" | "created_at" | "updated_at">) => {
    if (!memoryToken) {
      throw new Error("Authentication required to create server");
    }
    return apiClient.post<Server>("/servers", data);
  },
  update: (id: string, data: Partial<Server>) => {
    if (!memoryToken) {
      throw new Error("Authentication required to update server");
    }
    return apiClient.put<Server>(`/servers/${id}`, data);
  },
  delete: (id: string) => {
    if (!memoryToken) {
      throw new Error("Authentication required to delete server");
    }
    return apiClient.delete(`/servers/${id}`);
  },
};

// User profile API
export const userApi = {
  getProfile: () => {
    if (!memoryToken) {
      throw new Error("Authentication required to fetch user profile");
    }
    return apiClient.get<User>("/auth/profile").catch((error) => {
      console.error("Failed to fetch user profile:", error);
      if (error.message === "Unauthorized") {
        // Clear token on unauthorized
        setAuthToken(null);
        sessionStorage.removeItem("auth_token");
        window.location.href = "/login";
      }
      throw error;
    });
  },
};
