import { useState } from "react";
import { ChevronLeft, ChevronRight, Search, ChevronDown, LogOut, User, Settings, Music } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export function TopNavigation() {
  const [searchQuery, setSearchQuery] = useState("");
  const { user, refetch } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const logoutMutation = useMutation({
    mutationFn: () => apiRequest("/api/auth/logout", { method: "POST" }),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Logged out successfully",
      });
      refetch();
      setLocation("/login");
    },
  });

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      // Navigate to browse page with search query
      setLocation(`/browse?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="flex items-center justify-between p-3 md:p-6 bg-spotify-light-gray/95 backdrop-blur-md border-b border-gray-700/50 sticky top-0 z-30">
      {/* Navigation Buttons - Hidden on mobile */}
      <div className="hidden md:flex items-center space-x-4">
        <Button
          variant="ghost"
          size="sm"
          className="w-8 h-8 bg-black/50 rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors p-0"
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="w-8 h-8 bg-black/50 rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors p-0"
        >
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>

      {/* Mobile Logo */}
      <div className="md:hidden flex items-center space-x-2">
        <div className="w-8 h-8 bg-gradient-to-br from-spotify-green to-creator-orange rounded-lg flex items-center justify-center">
          <Music className="w-5 h-5 text-black" />
        </div>
        <span className="text-xl font-bold text-white">RiseUp</span>
      </div>

      <div className="flex items-center space-x-2 md:space-x-4 flex-1 md:flex-initial justify-end md:justify-center">
        <div className="relative w-full max-w-xs md:max-w-md lg:max-w-lg">
          <Input
            type="text"
            placeholder="What do you want to listen to?"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearch}
            className="w-full pl-10 pr-4 py-2 bg-white/95 rounded-full text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-spotify-green border-0 text-sm md:text-base"
          />
          <Search className="w-4 h-4 md:w-5 md:h-5 text-gray-500 absolute left-3 top-1/2 transform -translate-y-1/2" />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center space-x-1 md:space-x-2 bg-black/50 hover:bg-gray-800 px-2 md:px-4 py-2 rounded-full"
            >
              <div className="w-6 h-6 md:w-8 md:h-8 bg-gradient-to-br from-spotify-green to-creator-orange rounded-full flex items-center justify-center">
                <span className="text-black font-bold text-xs md:text-sm">
                  {user?.username?.[0]?.toUpperCase() || "G"}
                </span>
              </div>
              <span className="hidden sm:block text-sm md:text-base">{user?.username || "Guest"}</span>
              <ChevronDown className="w-3 h-3 md:w-4 md:h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 bg-spotify-light-gray border-gray-700">
            <DropdownMenuItem 
              onClick={() => setLocation("/profile")}
              className="text-white hover:bg-spotify-dark cursor-pointer"
            >
              <User className="w-4 h-4 mr-2" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => setLocation("/settings")}
              className="text-white hover:bg-spotify-dark cursor-pointer"
            >
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-gray-600" />
            <DropdownMenuItem 
              onClick={() => logoutMutation.mutate()}
              className="text-white hover:bg-spotify-dark cursor-pointer"
            >
              <LogOut className="w-4 h-4 mr-2" />
              {logoutMutation.isPending ? "Logging out..." : "Log out"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
