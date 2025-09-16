import React, { useState, useEffect } from "react";
import useAuthStore from "@/store/authStore";
import { chatApi } from "@/api/chatApi";
import { userApi } from "@/api/userApi";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

// Define types for chat and user data
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
  createdAt: string;
}

interface Chat {
  _id: string;
  chatName: string;
  isGroupChat: boolean;
  users: User[];
  latestMessage?: Message;
}

interface SidebarProps {
  onChatSelect: (chat: Chat) => void;
  selectedChat: Chat | null;
}

const Sidebar = ({ onChatSelect, selectedChat }: SidebarProps) => {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();
  const [chats, setChats] = useState<Chat[]>([]);
  const [loadingChats, setLoadingChats] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleProfile = () => {
    navigate("/profile");
  };

  // Fetch user's chats
  useEffect(() => {
    const fetchChats = async () => {
      if (!user) return;
      setLoadingChats(true);
      try {
        const fetchedChats = await chatApi.fetchChats();
        setChats(fetchedChats);
      } catch (error) {
        console.error("Failed to fetch chats:", error);
      } finally {
        setLoadingChats(false);
      }
    };
    fetchChats();
  }, [user]);

  // Fetch all users to start new chats
  useEffect(() => {
    const fetchUsers = async () => {
      setLoadingUsers(true);
      try {
        const fetchedUsers = await userApi.getAllUsers();
        setUsers(fetchedUsers.filter((u) => u._id !== user?._id));
      } catch (error) {
        console.error("Failed to fetch users:", error);
      } finally {
        setLoadingUsers(false);
      }
    };
    fetchUsers();
  }, [user]);

  const handleNewChat = async (targetUserId: string) => {
    try {
      const createdChat = await chatApi.accessChat(targetUserId);
      onChatSelect(createdChat);
      // Re-fetch chats to update the list
      const updatedChats = await chatApi.fetchChats();
      setChats(updatedChats);
    } catch (error) {
      console.error("Failed to create new chat:", error);
    }
  };

  const getChatName = (chat: Chat) => {
    if (chat.isGroupChat) {
      return chat.chatName;
    }
    const otherUser = chat.users.find((u) => u._id !== user?._id);
    return otherUser?.username || "Unknown User";
  };

  return (
    <aside className="w-80 flex-shrink-0 border-r border-gray-200 dark:border-gray-800 p-4 flex flex-col h-full">
      <div className="flex items-center space-x-4 mb-6">
        <Avatar onClick={handleProfile} className="cursor-pointer">
          <AvatarImage src={user?.avatar} />
          <AvatarFallback>{user?.username?.[0]}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h2 className="text-lg font-bold">{user?.username}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Online</p>
        </div>
        <Button variant="ghost" size="sm" onClick={handleLogout}>
          <LogOut className="h-4 w-4" />
        </Button>
      </div>

      {/* AI Chat Option - Prominent at top */}
      <Card
        onClick={() =>
          onChatSelect({
            _id: "ai",
            chatName: "AI Chat",
            isGroupChat: false,
            users: [],
            latestMessage: {
              _id: "",
              sender: { _id: "", username: "", email: "" },
              content: "",
              createdAt: "",
            },
          })
        }
        className={cn(
          "cursor-pointer mb-4 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 border-2",
          selectedChat?._id === "ai" &&
            "bg-blue-100 dark:bg-blue-900 border-blue-500"
        )}
      >
        <CardContent className="flex items-center p-3 space-x-4">
          <Avatar>
            <AvatarFallback>🤖</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h4 className="font-semibold text-blue-600 dark:text-blue-400">
              AI Chatbot
            </h4>
            <p className="text-xs text-gray-500 truncate dark:text-gray-400">
              Chat with AI assistant
            </p>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="chats" className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="chats">My Chats</TabsTrigger>
          <TabsTrigger value="users">New Users</TabsTrigger>
        </TabsList>
        <TabsContent value="chats" className="flex-1 mt-2">
          {loadingChats ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
            </div>
          ) : chats.length > 0 ? (
            <ScrollArea className="h-full rounded-md border p-2">
              {chats.map((chat) => (
                <Card
                  key={chat._id}
                  onClick={() => onChatSelect(chat)}
                  className={cn(
                    "cursor-pointer mb-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800",
                    selectedChat?._id === chat._id &&
                      "bg-gray-200 dark:bg-gray-700"
                  )}
                >
                  <CardContent className="flex items-center p-3 space-x-4">
                    <Avatar>
                      <AvatarImage
                        src={
                          chat.users.find((u) => u._id !== user?._id)?.avatar
                        }
                      />
                      <AvatarFallback>{getChatName(chat)?.[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h4 className="font-semibold">{getChatName(chat)}</h4>
                      <p className="text-xs text-gray-500 truncate dark:text-gray-400">
                        {chat.latestMessage?.content || "No messages yet"}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </ScrollArea>
          ) : (
            <p className="text-sm text-gray-500 text-center mt-4">
              No chats found.
            </p>
          )}
        </TabsContent>
        <TabsContent value="users" className="flex-1 mt-2">
          {loadingUsers ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
            </div>
          ) : (
            <ScrollArea className="h-full rounded-md border p-2">
              {users.map((u) => (
                <Button
                  key={u._id}
                  variant="ghost"
                  className="w-full justify-start space-x-4 p-3 h-auto"
                  onClick={() => handleNewChat(u._id)}
                >
                  <Avatar>
                    <AvatarImage src={u.avatar || ""} />
                    <AvatarFallback>{u.username[0]}</AvatarFallback>
                  </Avatar>
                  <span className="font-medium">{u.username}</span>
                </Button>
              ))}
            </ScrollArea>
          )}
        </TabsContent>
      </Tabs>
    </aside>
  );
};

export default Sidebar;
