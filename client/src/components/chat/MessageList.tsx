import { useRef, useEffect } from "react";
import useAuthStore from "@/store/authStore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

// Define the types for a user and message
interface User {
  _id: string;
  username: string;
  avatar?: string;
}

interface Message {
  _id: string;
  sender: User;
  content: string;
  createdAt: string;
}

interface MessageListProps {
  messages: Message[];
}

const MessageList = ({ messages }: MessageListProps) => {
  const user = useAuthStore((state) => state.user);
  const lastMessageRef = useRef<HTMLDivElement>(null);

  // Scroll to the latest message whenever the messages array changes
  useEffect(() => {
    if (lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <ScrollArea className="h-[calc(100vh-250px)] p-4">
      <div className="flex flex-col space-y-4">
        {messages.map((message, index) => {
          const isSender = message.sender._id === user?._id;
          const isLastMessage = index === messages.length - 1;

          return (
            <div
              key={message._id}
              className={cn(
                "flex items-start gap-4",
                isSender ? "justify-end" : "justify-start"
              )}
              ref={isLastMessage ? lastMessageRef : null}
            >
              {!isSender && (
                <Avatar>
                  <AvatarImage src={message.sender.avatar} />
                  <AvatarFallback>{message.sender.username[0]}</AvatarFallback>
                </Avatar>
              )}
              <Card
                className={cn(
                  "max-w-md p-3 text-sm rounded-lg",
                  isSender
                    ? "bg-blue-600 text-white dark:bg-blue-500"
                    : "bg-gray-200 dark:bg-gray-800"
                )}
              >
                <p>{message.content}</p>
              </Card>
              {isSender && (
                <Avatar>
                  <AvatarImage src={message.sender.avatar} />
                  <AvatarFallback>{message.sender.username[0]}</AvatarFallback>
                </Avatar>
              )}
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
};

MessageList.displayName = "MessageList";

export default MessageList;
