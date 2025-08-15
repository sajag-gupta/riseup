import React, { Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Switch, Route } from "wouter";
import { Toaster } from "./components/ui/toaster";
import { useAuth } from "./hooks/use-auth";
import { Sidebar } from "./components/layout/Sidebar";
import { TopNavigation } from "./components/layout/TopNavigation";
import { NowPlayingBar } from "./components/layout/NowPlayingBar";
import Home from "./pages/Home";
import Browse from "./pages/Browse";
import Library from "./pages/Library";
import Shop from "./pages/Shop";
import CreatorDashboard from "./pages/CreatorDashboard";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import AppLibrary from "./pages/AppLibrary";
import AdminPanel from "./pages/AdminPanel";
import NowPlaying from "./pages/NowPlaying";
import Genre from "./pages/Genre";
import LikedSongs from "./pages/LikedSongs";
import Playlists from "./pages/Playlists";
import "./index.css";

// Import PlayerProvider
import { PlayerProvider } from "./context/PlayerContext";
// Import Footer component
import { Footer } from "./components/layout/Footer";

function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-spotify-black text-white">
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-screen">
        <TopNavigation />
        <div className="flex-1 overflow-y-auto">
          {children}
          <Footer />
        </div>
      </div>
      <NowPlayingBar />
    </div>
  );
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="h-screen bg-spotify-dark flex items-center justify-center">
        <div className="text-white text-xl">Loading Rise Up Creators...</div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-spotify-dark text-white">
      <Switch>
        {/* Auth routes */}
        <Route path="/login" component={Login} />
        <Route path="/signup" component={Signup} />

        {/* Protected routes */}
        {isAuthenticated ? (
          <>
            <Route path="/" component={() => <MainLayout><Home /></MainLayout>} />
            <Route path="/browse" component={() => <MainLayout><Browse /></MainLayout>} />
            <Route path="/app-library" component={() => <MainLayout><AppLibrary /></MainLayout>} />
            <Route path="/library" component={() => <MainLayout><Library /></MainLayout>} />
            <Route path="/shop" component={() => <MainLayout><Shop /></MainLayout>} />
            <Route path="/creator-dashboard" component={() => <MainLayout><CreatorDashboard /></MainLayout>} />
            <Route path="/profile" component={() => <MainLayout><Profile /></MainLayout>} />
            <Route path="/settings" component={() => <MainLayout><Settings /></MainLayout>} />
            <Route path="/now-playing/:id" component={NowPlaying} />
            <Route path="/genre/:genre" component={Genre} />
            <Route path="/liked-songs" component={() => <MainLayout><LikedSongs /></MainLayout>} />
            <Route path="/playlists" component={() => <MainLayout><Playlists /></MainLayout>} />
            <Route path="/admin" component={AdminPanel} />
          </>
        ) : (
          <>
            {/* Redirect to login for protected routes */}
            <Route path="/" component={Login} />
            <Route path="/browse" component={Login} />
            <Route path="/app-library" component={Login} />
            <Route path="/library" component={Login} />
            <Route path="/shop" component={Login} />
            <Route path="/creator-dashboard" component={Login} />
            <Route path="/profile" component={Login} />
            <Route path="/settings" component={Login} />
            <Route path="/now-playing/:id" component={Login} />
            <Route path="/genre/:genre" component={Login} />
            <Route path="/liked-songs" component={Login} />
            <Route path="/playlists" component={Login} />
            <Route path="/admin" component={Login} />
          </>
        )}
      </Switch>
      <Toaster />
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      {/* PlayerProvider wraps the entire app so usePlayer works everywhere */}
      <PlayerProvider>
        <Router />
      </PlayerProvider>
    </QueryClientProvider>
  );
}