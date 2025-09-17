import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../store/authStore";
import { useSocket } from "../hooks/useSocket";
import { Loader2 } from "lucide-react";
import Sidebar from "@/components/common/Sidebar";
import ChatWindow from "@/components/chat/ChatWindow";
import AIChatWindow from "@/components/chat/AIChatWindow";
import ThemeToggle from "@/components/common/ThemeToggle";
import type { Chat, User } from "@/types";

const ChatPage = () => {
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const { on, off } = useSocket();
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Effect to handle authentication and redirection
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  // Handle real-time updates for user status
  useEffect(() => {
    on("user_status_update", (updatedUser: User) => {
      // Update the user's online status in your chat list
      console.log(`User status updated: ${updatedUser.username} is now online`);
    });

    // Clean up listener
    return () => {
      off("user_status_update", () => {});
    };
  }, [on, off]);

  if (!isAuthenticated) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950 text-gray-800 dark:text-gray-200">
      {/* Sidebar with a responsive toggle */}
      <div
        className={`flex-shrink-0 transition-all duration-300 ease-in-out ${isSidebarOpen ? "w-80" : "w-0 overflow-hidden"}`}
      >
        <Sidebar onChatSelect={setSelectedChat} selectedChat={selectedChat} />
      </div>

      <div className="flex-1 flex flex-col">
        <div className="flex justify-between items-center p-4 border-b">
          <button
            className="lg:hidden text-gray-600 dark:text-gray-400"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            {isSidebarOpen ? "Close" : "Open"} Sidebar
          </button>
          <div className="flex items-center gap-4">
            <span className="text-xl font-bold">
              {selectedChat ? selectedChat.chatName : "Synk"}
            </span>
            <ThemeToggle />
          </div>
        </div>
        <main className="flex-1 overflow-auto">
          {selectedChat ? (
            selectedChat._id === "ai" ? (
              <AIChatWindow />
            ) : (
              <ChatWindow selectedChat={selectedChat} />
            )
          ) : (
            <div className="h-full flex items-center justify-center">
              <p className="text-xl text-gray-400">
                Select a chat to start a conversation
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default ChatPage;
