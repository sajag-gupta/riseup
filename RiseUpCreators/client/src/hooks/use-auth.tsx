import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../lib/queryClient";

interface User {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  bio?: string;
  profilePicture?: string;
  userType: 'fan' | 'creator';
  monthlyListeners?: number;
  totalEarnings?: string;
  createdAt: string;
}

interface AuthHook {
  user: User | null;
  isLoading: boolean;
  refetch: () => void;
}

export function useAuth(): AuthHook {
  const queryClient = useQueryClient();

  const { data: user, isLoading, refetch } = useQuery({
    queryKey: ["/api/auth/user"],
    queryFn: async () => {
      try {
        const response = await fetch("/api/auth/user", { 
          credentials: "include",
          headers: {
            "Content-Type": "application/json"
          }
        });
        if (response.status === 401) return null;
        if (!response.ok) throw new Error("Failed to fetch user");
        return response.json();
      } catch (error) {
        console.error("Auth fetch error:", error);
        return null;
      }
    },
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    user: user || null,
    isLoading,
    refetch,
  };
}