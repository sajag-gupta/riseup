
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface User {
  id: string;
  username: string;
  email: string;
  userType: 'fan' | 'creator';
  firstName?: string;
  lastName?: string;
  profilePicture?: string;
  bio?: string;
  monthlyListeners?: number;
  totalEarnings?: string;
  isVerified?: boolean;
}

export function useAuth() {
  const queryClient = useQueryClient();

  const { 
    data: user, 
    isLoading, 
    refetch, 
    error,
    isFetched
  } = useQuery<User>({
    queryKey: ["/api/auth/user"],
    queryFn: async () => {
      try {
        const response = await fetch("/api/auth/user", { 
          credentials: "include",
          headers: {
            'Content-Type': 'application/json',
          }
        });
        if (response.status === 401) return null;
        if (!response.ok) throw new Error("Failed to fetch user");
        return response.json();
      } catch {
        return null;
      }
    },
    retry: false,
    staleTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const loginMutation = useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Login failed");
      }
      return response.json();
    },
    onSuccess: (userData) => {
      queryClient.setQueryData(["/api/auth/user"], userData.user);
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (userData: any) => {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(userData),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Registration failed");
      }
      return response.json();
    },
    onSuccess: (userData) => {
      queryClient.setQueryData(["/api/auth/user"], userData.user);
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      if (!response.ok) throw new Error("Logout failed");
      return response.json();
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/auth/user"], null);
    },
  });

  const login = async (email: string, password: string) => {
    await loginMutation.mutateAsync({ email, password });
  };

  const register = async (userData: any) => {
    await registerMutation.mutateAsync(userData);
  };

  const logout = async () => {
    await logoutMutation.mutateAsync();
  };

  // User is authenticated if we have user data and no auth error
  const isAuthenticated = !!user && !error;
  
  // Loading is true only on the initial load
  const loading = isLoading && !isFetched;

  return {
    user,
    isLoading: loading,
    isAuthenticated,
    login,
    register,
    logout,
    refetch,
    error,
  };
}
