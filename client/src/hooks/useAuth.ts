import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useEffect } from "react";

interface User {
  id: number;
  username: string;
  email: string;
  name: string;
  role: string;
}

export function useAuth(requireAuth = true) {
  const [, setLocation] = useLocation();

  const { data, isLoading, error } = useQuery<{ success: boolean; user: User }>({
    queryKey: ["/api/me"],
  });

  useEffect(() => {
    if (requireAuth && !isLoading && (error || !data?.success)) {
      setLocation("/login");
    }
  }, [requireAuth, isLoading, error, data, setLocation]);

  return {
    user: data?.user,
    isLoading,
    isAuthenticated: !!data?.success,
  };
}
