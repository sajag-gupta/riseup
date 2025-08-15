import { useState } from "react";
import { ChevronLeft, ChevronRight, Search, ChevronDown, LogOut, User, Settings, Music, Menu } from "lucide-react";
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
    onError: (error) => {
      console.error('Logout error:', error);
      toast({
        title: "Error",
        description: "Failed to logout. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    try {
      if (e.key === 'Enter' && searchQuery.trim()) {
        // Navigate to browse page with search query
        setLocation(`/browse?search=${encodeURIComponent(searchQuery.trim())}`);
      }
    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: "Error",
        description: "Failed to perform search. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <header className="flex items-center justify-between p-3 md:p-4 bg-black/40 backdrop-blur-lg border-b border-white/20 sticky top-0 z-30 h-14 md:h-16">
      {/* Logo - Hidden on mobile, shown on desktop */}
      <div className="hidden md:flex items-center space-x-3">
        <div className="w-8 h-8 bg-gradient-to-br from-spotify-green to-creator-orange rounded-lg flex items-center justify-center">
          <Music className="w-5 h-5 text-black" />
        </div>
        <span className="text-xl font-bold text-white">RiseUp</span>
      </div>

      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between w-full">
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.preventDefault();
              try {
                const sidebarToggle = document.querySelector('[data-sidebar-toggle]') as HTMLButtonElement;
                if (sidebarToggle) {
                  sidebarToggle.click();
                } else {
                  console.warn('Sidebar toggle button not found');
                }
              } catch (error) {
                console.error('Error toggling sidebar:', error);
              }
            }}
            className="p-2 hover:bg-white/10 rounded-full"
          >
            <Menu className="w-5 h-5 text-white" />
          </Button>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-spotify-green to-creator-orange rounded-lg flex items-center justify-center">
              <Music className="w-5 h-5 text-black" />
            </div>
            <span className="text-xl font-bold text-white">RiseUp</span>
          </div>
        </div>

        {/* Mobile User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center space-x-2 hover:bg-white/10 px-2 py-2 rounded-full"
            >
              <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-white/20">
                {user?.profilePicture ? (
                  <img 
                    src={user.profilePicture} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-spotify-green to-creator-orange flex items-center justify-center">
                    <span className="text-black font-bold text-sm">
                      {user?.firstName?.[0]}{user?.lastName?.[0]}
                    </span>
                  </div>
                )}
              </div>
              <ChevronDown className="w-4 h-4 text-white" />
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

      {/* Desktop Search and User Menu */}
      <div className="hidden md:flex items-center space-x-6 flex-1 justify-center">
        <div className="relative w-full max-w-md lg:max-w-lg">
          <Input
            type="text"
            placeholder="What do you want to listen to?"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearch}
            className="w-full pl-10 pr-4 py-2 bg-white/95 rounded-full text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-spotify-green border-0"
          />
          <Search className="w-5 h-5 text-gray-500 absolute left-3 top-1/2 transform -translate-y-1/2" />
        </div>
      </div>

      {/* Desktop User Menu */}
      <div className="hidden md:flex">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center space-x-3 hover:bg-white/10 px-3 py-2 rounded-full"
            >
              <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-white/20">
                {user?.profilePicture ? (
                  <img 
                    src={user.profilePicture} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-spotify-green to-creator-orange flex items-center justify-center">
                    <span className="text-black font-bold text-sm">
                      {user?.firstName?.[0]}{user?.lastName?.[0]}
                    </span>
                  </div>
                )}
              </div>
              <span className="text-white font-medium">@{user?.username}</span>
              <ChevronDown className="w-4 h-4 text-white" />
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