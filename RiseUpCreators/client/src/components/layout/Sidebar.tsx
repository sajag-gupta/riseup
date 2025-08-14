
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import {
  Home,
  Search,
  Library,
  Plus,
  Heart,
  Music,
  ShoppingBag,
  User,
  Settings,
  Crown,
  Menu,
  X,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const [location, setLocation] = useLocation();
  const { user } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setIsCollapsed(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const mainNavItems = [
    { icon: Home, label: "Home", path: "/" },
    { icon: Search, label: "Browse", path: "/browse" },
    { icon: Library, label: "App Library", path: "/app-library" },
  ];

  const libraryItems = [
    { icon: Heart, label: "Liked Songs", path: "/liked-songs" },
    { icon: Music, label: "Playlists", path: "/playlists" },
  ];

  const accountItems = [
    { icon: User, label: "Profile", path: "/profile" },
    { icon: ShoppingBag, label: "Shop", path: "/shop" },
    { icon: Settings, label: "Settings", path: "/settings" },
  ];

  const isActive = (path: string) => location === path;

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className={cn(
        "flex items-center p-6 border-b border-gray-700",
        isCollapsed && !isMobile ? "justify-center" : "justify-between"
      )}>
        {(!isCollapsed || isMobile) && (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-spotify-green to-creator-orange rounded-lg flex items-center justify-center">
              <Music className="w-5 h-5 text-black" />
            </div>
            <span className="text-xl font-bold text-white">RiseUp</span>
          </div>
        )}
        
        {isMobile ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMobileOpen(false)}
            className="text-gray-400 hover:text-white md:hidden"
          >
            <X className="w-5 h-5" />
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-gray-400 hover:text-white hidden md:flex"
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </Button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto">
        {/* Main Navigation */}
        <div className="space-y-1">
          {mainNavItems.map((item) => (
            <Button
              key={item.path}
              variant="ghost"
              onClick={() => {
                setLocation(item.path);
                if (isMobile) setIsMobileOpen(false);
              }}
              className={cn(
                "w-full text-left text-gray-400 hover:text-white hover:bg-gray-700 transition-colors",
                isActive(item.path) && "text-white bg-gray-700",
                isCollapsed && !isMobile ? "justify-center px-2" : "justify-start px-4"
              )}
            >
              <item.icon className={cn(
                "w-5 h-5",
                isCollapsed && !isMobile ? "" : "mr-3"
              )} />
              {(!isCollapsed || isMobile) && item.label}
            </Button>
          ))}
        </div>

        {/* Library Section */}
        <div className="space-y-1">
          {(!isCollapsed || isMobile) && (
            <h3 className="px-4 text-sm font-medium text-gray-400 uppercase tracking-wider">
              Your Library
            </h3>
          )}
          {libraryItems.map((item) => (
            <Button
              key={item.path}
              variant="ghost"
              onClick={() => {
                setLocation(item.path);
                if (isMobile) setIsMobileOpen(false);
              }}
              className={cn(
                "w-full text-left text-gray-400 hover:text-white hover:bg-gray-700 transition-colors",
                isActive(item.path) && "text-white bg-gray-700",
                isCollapsed && !isMobile ? "justify-center px-2" : "justify-start px-4"
              )}
            >
              <item.icon className={cn(
                "w-5 h-5",
                isCollapsed && !isMobile ? "" : "mr-3"
              )} />
              {(!isCollapsed || isMobile) && item.label}
            </Button>
          ))}
        </div>

        {/* Account Section */}
        <div className="space-y-1">
          {(!isCollapsed || isMobile) && (
            <h3 className="px-4 text-sm font-medium text-gray-400 uppercase tracking-wider">
              Account
            </h3>
          )}
          {accountItems.map((item) => (
            <Button
              key={item.path}
              variant="ghost"
              onClick={() => {
                setLocation(item.path);
                if (isMobile) setIsMobileOpen(false);
              }}
              className={cn(
                "w-full text-left text-gray-400 hover:text-white hover:bg-gray-700 transition-colors",
                isActive(item.path) && "text-white bg-gray-700",
                isCollapsed && !isMobile ? "justify-center px-2" : "justify-start px-4"
              )}
            >
              <item.icon className={cn(
                "w-5 h-5",
                isCollapsed && !isMobile ? "" : "mr-3"
              )} />
              {(!isCollapsed || isMobile) && item.label}
            </Button>
          ))}

          {/* Admin Panel - Only for admins */}
          {user?.email === "admin@riseup.com" && (
            <Button
              variant="ghost"
              onClick={() => {
                setLocation("/admin");
                if (isMobile) setIsMobileOpen(false);
              }}
              className={cn(
                "w-full text-left text-creator-orange hover:text-white hover:bg-gray-700 transition-colors",
                isActive("/admin") && "text-white bg-gray-700",
                isCollapsed && !isMobile ? "justify-center px-2" : "justify-start px-4"
              )}
            >
              <Crown className={cn(
                "w-5 h-5",
                isCollapsed && !isMobile ? "" : "mr-3"
              )} />
              {(!isCollapsed || isMobile) && "Admin Panel"}
            </Button>
          )}
        </div>
      </nav>

      {/* User Info */}
      {user && (!isCollapsed || isMobile) && (
        <div className="p-4 border-t border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-spotify-green to-creator-orange rounded-full flex items-center justify-center">
              <span className="text-black font-semibold text-sm">
                {user.username?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-medium truncate">
                {user.username || user.email}
              </p>
              <p className="text-gray-400 text-sm truncate">Free Plan</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  if (isMobile) {
    return (
      <>
        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsMobileOpen(true)}
          className="fixed top-4 left-4 z-[70] bg-spotify-light-gray text-white hover:bg-gray-600 md:hidden"
        >
          <Menu className="w-5 h-5" />
        </Button>

        {/* Mobile Overlay */}
        {isMobileOpen && (
          <div className="fixed inset-0 bg-black/50 z-[55] md:hidden" onClick={() => setIsMobileOpen(false)} />
        )}

        {/* Mobile Sidebar */}
        <aside className={cn(
          "fixed left-0 top-0 h-full w-64 bg-spotify-black border-r border-gray-700 z-[60] transform transition-transform duration-200 md:hidden",
          isMobileOpen ? "translate-x-0" : "-translate-x-full",
          className
        )}>
          <SidebarContent />
        </aside>
      </>
    );
  }

  return (
    <aside className={cn(
      "hidden md:flex h-full bg-spotify-black border-r border-gray-700 transition-all duration-200",
      isCollapsed ? "w-20" : "w-64",
      className
    )}>
      <SidebarContent />
    </aside>
  );
}
