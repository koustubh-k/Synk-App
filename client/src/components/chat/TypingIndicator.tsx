import React, { useState, useEffect } from "react";
import { useSocket } from "@/hooks/useSocket";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

// Define the component's props
interface TypingIndicatorProps {
  selectedChatId: string;
}

const TypingIndicator = ({ selectedChatId }: TypingIndicatorProps) => {
  const { on, off } = useSocket();
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    const handleTyping = (chatId: string) => {
      if (chatId === selectedChatId) {
        setIsTyping(true);
      }
    };

    const handleStopTyping = (chatId: string) => {
      if (chatId === selectedChatId) {
        setIsTyping(false);
      }
    };

    on("typing", handleTyping);
    on("stop typing", handleStopTyping);

    // Clean up listeners when the component unmounts
    return () => {
      off("typing", handleTyping);
      off("stop typing", handleStopTyping);
    };
  }, [selectedChatId, on, off]);

  if (!isTyping) {
    return null; // Don't render anything if no one is typing
  }

  return (
    <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 p-2">
      <Loader2 className="h-4 w-4 animate-spin" />
      <span>Typing...</span>
    </div>
  );
};

export default TypingIndicator;
