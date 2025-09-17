import { useState, useRef, useEffect } from "react";
import { chatApi } from "@/api/chatApi";
import useAuthStore from "@/store/authStore";
import { Loader2, Bot } from "lucide-react";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

// Define types for AI chat messages
interface AIMessage {
  _id: string;
  sender: "user" | "ai";
  content: string;
  createdAt: string;
}

const AIChatWindow = () => {
  const user = useAuthStore((state) => state.user);
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;

    // Add user message to local state
    const userMessage: AIMessage = {
      _id: Date.now().toString(),
      sender: "user",
      content,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMessage]);

    setIsLoading(true);
    try {
      // Get AI response
      const aiResponseContent = await chatApi.sendAIMessage(content);

      // Add AI response to local state
      const aiMessage: AIMessage = {
        _id: (Date.now() + 1).toString(),
        sender: "ai",
        content: aiResponseContent,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Failed to get AI response:", error);
      // Add error message
      const errorMessage: AIMessage = {
        _id: (Date.now() + 1).toString(),
        sender: "ai",
        content: "Sorry, I couldn't process your message. Please try again.",
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Convert AI messages to format compatible with MessageList
  const formattedMessages = messages.map((msg) => ({
    _id: msg._id,
    sender: {
      _id: msg.sender === "user" ? user?._id || "" : "ai",
      username:
        msg.sender === "user" ? user?.username || "You" : "AI Assistant",
      email: msg.sender === "user" ? user?.email || "" : "",
      avatar: undefined,
    },
    content: msg.content,
    createdAt: msg.createdAt,
  }));

  return (
    <Card className="flex flex-col h-full bg-white dark:bg-gray-900 border-none rounded-none">
      <CardHeader className="flex flex-row items-center border-b p-4">
        <Avatar>
          <AvatarFallback>
            <Bot className="h-6 w-6" />
          </AvatarFallback>
        </Avatar>
        <CardTitle className="ml-4">AI Assistant</CardTitle>
      </CardHeader>

      <CardContent className="flex-1 p-4 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Bot className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-xl text-gray-400">
                Start a conversation with the AI assistant
              </p>
            </div>
          </div>
        ) : (
          <MessageList messages={formattedMessages} />
        )}
        {isLoading && (
          <div className="flex items-center justify-center p-4">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span>AI is thinking...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </CardContent>

      <div className="p-4 border-t">
        <MessageInput onSendMessage={handleSendMessage} selectedChatId="ai" />
      </div>
    </Card>
  );
};

export default AIChatWindow;
