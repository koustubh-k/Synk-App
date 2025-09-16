import React, { useState, useEffect } from "react";
import { useSocket } from "@/hooks/useSocket";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";
import { cn } from "@/lib/utils";

// Define the component's props
interface MessageInputProps {
  onSendMessage: (content: string) => void;
  selectedChatId: string;
}

const MessageInput = ({ onSendMessage, selectedChatId }: MessageInputProps) => {
  const [message, setMessage] = useState("");
  const { emit } = useSocket();
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(
    null
  );

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);

    if (!isTyping) {
      setIsTyping(true);
      emit("typing", selectedChatId);
    }

    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }

    const timeout = setTimeout(() => {
      setIsTyping(false);
      emit("stop typing", selectedChatId);
    }, 3000);

    setTypingTimeout(timeout);
  };

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message);
      setMessage("");
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }
      emit("stop typing", selectedChatId);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  return (
    <div className="flex w-full items-center space-x-2">
      <Input
        type="text"
        placeholder="Type a message..."
        value={message}
        onChange={handleTyping}
        onKeyDown={handleKeyDown}
        className="flex-1"
      />
      <Button type="button" onClick={handleSend} disabled={!message.trim()}>
        <Send className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default MessageInput;
