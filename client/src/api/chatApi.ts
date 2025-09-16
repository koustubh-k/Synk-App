import axios from "axios";
import useAuthStore from "@/store/authStore";

const API_URL = import.meta.env.VITE_API_URL;

// Define interfaces for chat and message data
interface User {
  _id: string;
  username: string;
  email: string;
  avatar?: string;
}

interface Message {
  _id: string;
  sender: User;
  content: string;
  chat: Chat;
  createdAt: string;
  mediaUrl?: string;
}

interface Chat {
  _id: string;
  isGroupChat: boolean;
  chatName: string;
  users: User[];
  latestMessage: Message;
}

// Create an axios instance with a base URL
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor to attach the JWT to every outgoing request
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().user?.token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * @desc Fetches all chats for the currently logged-in user.
 * @returns A promise that resolves to an array of chat objects.
 */
const fetchChats = async (): Promise<Chat[]> => {
  try {
    const response = await api.get("/chats");
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to fetch chats");
  }
};

/**
 * @desc Creates a new chat or accesses an existing one with a user.
 * @param userId - The ID of the user to chat with.
 * @returns A promise that resolves to the chat object.
 */
const accessChat = async (userId: string): Promise<Chat> => {
  try {
    const response = await api.post("/chats", { userId });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to access chat");
  }
};

/**
 * @desc Fetches all messages for a specific chat.
 * @param chatId - The ID of the chat to fetch messages from.
 * @returns A promise that resolves to an array of message objects.
 */
const fetchMessages = async (chatId: string): Promise<Message[]> => {
  try {
    const response = await api.get(`/chats/message/${chatId}`);
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch messages"
    );
  }
};

/**
 * @desc Sends a new message to a chat.
 * @param chatId - The ID of the chat to send the message to.
 * @param content - The text content of the message.
 * @returns A promise that resolves to the created message object.
 */
const sendMessage = async (
  chatId: string,
  content: string
): Promise<Message> => {
  try {
    const response = await api.post("/chats/message", { chatId, content });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to send message");
  }
};

/**
 * @desc Sends a message to the AI chatbot and gets a response.
 * @param message - The user message to send to the AI.
 * @returns A promise that resolves to the AI response content.
 */
const sendAIMessage = async (message: string): Promise<string> => {
  try {
    const response = await api.post("/chats/ai/message", { message });
    return response.data.content;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to get AI response"
    );
  }
};

export const chatApi = {
  fetchChats,
  accessChat,
  fetchMessages,
  sendMessage,
  sendAIMessage,
};
