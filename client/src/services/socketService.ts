import { io, Socket } from "socket.io-client";

// Define a type for your socket instance
type AppSocket = Socket;

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;

let socket: AppSocket | null = null;

const socketService = {
  // Connects to the Socket.IO server
  connect: (token: string, onConnect?: () => void) => {
    if (!socket || !socket.connected) {
      socket = io(SOCKET_URL!, {
        auth: {
          token,
        },
      });

      socket.on("connect", () => {
        console.log("Socket connected successfully.");
        if (onConnect) {
          onConnect();
        }
      });

      socket.on("disconnect", () => {
        console.log("Socket disconnected.");
      });

      socket.on("connect_error", (err) => {
        console.error("Socket connection error:", err.message);
      });
    }
  },

  // Disconnects from the Socket.IO server
  disconnect: () => {
    if (socket && socket.connected) {
      socket.disconnect();
    }
  },

  // Emits a real-time event to the server
  emit: (event: string, data: any) => {
    if (socket && socket.connected) {
      socket.emit(event, data);
    }
  },

  // Listens for a real-time event from the server
  on: (event: string, callback: (...args: any[]) => void) => {
    if (socket) {
      socket.on(event, callback);
    }
  },

  // Removes an event listener
  off: (event: string, callback?: (...args: any[]) => void) => {
    if (socket) {
      socket.off(event, callback);
    }
  },

  // Returns the current socket instance
  getSocket: () => {
    return socket;
  },
};

export default socketService;
