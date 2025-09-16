import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "@/store/authStore";
import AuthForms from "@/components/user/AuthForms";
import { Loader2 } from "lucide-react";

const HomePage = () => {
  const { isAuthenticated, initializeAuth } = useAuthStore();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initializeAuth();
    setIsLoading(false);
  }, [initializeAuth]);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate("/chat");
    }
  }, [isAuthenticated, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
      <AuthForms />
    </div>
  );
};

export default HomePage;
