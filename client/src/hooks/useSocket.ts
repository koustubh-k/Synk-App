import { useEffect } from "react";
import socketService from "../services/socketService";
import useAuthStore from "../store/authStore";
import { useNavigate } from "react-router-dom";

// This custom hook provides access to the socket connection
// and handles authentication and disconnections.
export const useSocket = () => {
  const { user, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/");
      return;
    }

    if (user && user.token) {
      socketService.connect(user.token);
    }

    // Clean up socket connection on component unmount
    return () => {
      socketService.disconnect();
    };
  }, [isAuthenticated, user?.token, navigate]);

  // Simple wrapper to emit events
  const emit = (event: string, data: any) => {
    socketService.emit(event, data);
  };

  // Simple wrapper to listen for events
  const on = (event: string, callback: (...args: any[]) => void) => {
    socketService.on(event, callback);
  };

  // Simple wrapper to stop listening for events
  const off = (event: string, callback: (...args: any[]) => void) => {
    socketService.off(event, callback);
  };

  return { emit, on, off, socket: socketService.getSocket() };
};
