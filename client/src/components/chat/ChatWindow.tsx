import { useState, useEffect } from "react";
import { useSocket } from "@/hooks/useSocket";
import { chatApi } from "@/api/chatApi";
import useAuthStore from "@/store/authStore";
import { Loader2 } from "lucide-react";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Chat, Message } from "@/types";

interface ChatWindowProps {
  selectedChat: Chat;
}

const ChatWindow = ({ selectedChat }: ChatWindowProps) => {
  const user = useAuthStore((state) => state.user);
  const { on, off, emit } = useSocket();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch messages for the selected chat and handle chat joining/leaving
  useEffect(() => {
    if (!selectedChat) {
      setMessages([]);
      return;
    }

    const chatId = selectedChat._id;

    const fetchMessages = async () => {
      setIsLoading(true);
      try {
        const fetchedMessages = await chatApi.fetchMessages(chatId);
        setMessages(fetchedMessages);
      } catch (error) {
        console.error("Failed to fetch messages:", error);
        setMessages([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessages();
    emit("join chat", chatId);

    // Clean up function to leave the chat room when component unmounts or chat changes
    return () => {
      emit("leave chat", chatId);
    };
    // The emit function from useSocket should be stable. Removing it from the
    // dependency array to prevent re-renders if the hook doesn't memoize it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedChat?._id]);

  // Set up real-time socket event listeners
  useEffect(() => {
    if (!selectedChat?._id) return;

    // Listen for new messages
    const messageReceivedHandler = (newMessage: Message) => {
      if (newMessage.chat._id === selectedChat._id) {
        setMessages((prevMessages) => [...prevMessages, newMessage]);
      }
    };

    on("message received", messageReceivedHandler);

    return () => {
      off("message received", messageReceivedHandler);
    };
    // on/off functions should be stable. Removing them from the dependency array
    // to prevent re-registering listeners on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedChat?._id]);

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || !selectedChat) return;
    emit("new message", { chatId: selectedChat._id, content });
  };

  // Get the name of the chat partner for a one-on-one chat
  const getChatPartnerName = () => {
    if (selectedChat.isGroupChat) {
      return selectedChat.chatName;
    }
    const partner = selectedChat.users.find((u) => u._id !== user?._id);
    return partner?.username || "Chat Partner";
  };

  const getChatPartnerAvatar = () => {
    if (selectedChat.isGroupChat) {
      // Placeholder for a group chat avatar
      return "https://via.placeholder.com/150";
    }
    const partner = selectedChat.users.find((u) => u._id !== user?._id);
    return partner?.avatar;
  };

  return (
    <Card className="flex flex-col h-full bg-white dark:bg-gray-900 border-none rounded-none">
      <CardHeader className="flex flex-row items-center border-b p-4">
        <Avatar>
          <AvatarImage src={getChatPartnerAvatar()} />
          <AvatarFallback>{getChatPartnerName()[0]}</AvatarFallback>
        </Avatar>
        <CardTitle className="ml-4">{getChatPartnerName()}</CardTitle>
      </CardHeader>

      <CardContent className="flex-1 p-4 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <MessageList messages={messages} />
        )}
      </CardContent>

      <div className="p-4 border-t">
        <MessageInput
          onSendMessage={handleSendMessage}
          selectedChatId={selectedChat._id}
        />
      </div>
    </Card>
  );
};

export default ChatWindow;
