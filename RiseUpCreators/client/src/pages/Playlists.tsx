
import { useState } from "react";
import { Plus, Music, Play, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Playlist {
  _id: string;
  name: string;
  description?: string;
  isPublic: boolean;
  trackIds: string[];
  createdAt: string;
  coverUrl?: string;
}

export default function Playlists() {
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [newPlaylistDescription, setNewPlaylistDescription] = useState("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: playlists = [], isLoading } = useQuery({
    queryKey: ["/api/playlists"],
    queryFn: async () => {
      const response = await fetch("/api/playlists", {
        credentials: "include",
      });
      if (!response.ok) {
        if (response.status === 401) return [];
        throw new Error("Failed to fetch playlists");
      }
      return response.json();
    },
  });

  const createPlaylistMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/playlists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: newPlaylistName,
          description: newPlaylistDescription,
          isPublic: false,
        }),
      });
      if (!response.ok) throw new Error("Failed to create playlist");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/playlists"] });
      toast({ title: "Playlist created successfully!" });
      setNewPlaylistName("");
      setNewPlaylistDescription("");
      setShowCreateDialog(false);
    },
    onError: () => {
      toast({ title: "Failed to create playlist", variant: "destructive" });
    },
  });

  const handleCreatePlaylist = () => {
    if (!newPlaylistName.trim()) {
      toast({ title: "Please enter a playlist name", variant: "destructive" });
      return;
    }
    createPlaylistMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-spotify-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-spotify-green mx-auto mb-4"></div>
          <p className="text-gray-400">Loading your playlists...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="flex-1 overflow-y-auto custom-scrollbar px-6 pb-24">
      <div className="py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-poppins font-bold text-white">Your Playlists</h1>
          
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="bg-spotify-green text-black hover:bg-spotify-light-green">
                <Plus className="w-4 h-4 mr-2" />
                Create Playlist
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-spotify-light-gray border-gray-700">
              <DialogHeader>
                <DialogTitle className="text-white">Create New Playlist</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
                    Playlist Name
                  </label>
                  <Input
                    id="name"
                    value={newPlaylistName}
                    onChange={(e) => setNewPlaylistName(e.target.value)}
                    placeholder="My Awesome Playlist"
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">
                    Description (Optional)
                  </label>
                  <Input
                    id="description"
                    value={newPlaylistDescription}
                    onChange={(e) => setNewPlaylistDescription(e.target.value)}
                    placeholder="Describe your playlist..."
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowCreateDialog(false)}
                    className="border-gray-600 text-white hover:bg-gray-700"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreatePlaylist}
                    disabled={createPlaylistMutation.isPending}
                    className="bg-spotify-green text-black hover:bg-spotify-light-green"
                  >
                    {createPlaylistMutation.isPending ? "Creating..." : "Create"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {playlists.length > 0 ? (
          <div className="space-y-6">
            {/* Recently Created */}
            <div>
              <h3 className="text-xl font-semibold text-white mb-4">Recently Created</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
                {playlists.slice(0, 6).map((playlist: Playlist) => (
                  <Card key={playlist._id} className="bg-spotify-light-gray hover:bg-gray-700 transition-colors cursor-pointer group">
                    <CardContent className="p-3 md:p-4">
                      <div className="relative mb-3 md:mb-4">
                        <div className="w-full aspect-square bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                          <Music className="w-8 h-8 md:w-12 md:h-12 text-white" />
                        </div>
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                          <Button className="w-10 h-10 md:w-12 md:h-12 bg-spotify-green rounded-full flex items-center justify-center shadow-lg">
                            <Play className="w-4 h-4 md:w-6 md:h-6 text-black ml-1" />
                          </Button>
                        </div>
                      </div>
                      <Link href={`/playlist/${playlist._id}`}>
                        <h3 className="text-white font-medium truncate mb-1 hover:underline text-sm md:text-base">
                          {playlist.name}
                        </h3>
                      </Link>
                      <p className="text-gray-400 text-xs md:text-sm truncate">
                        {playlist.trackIds.length} {playlist.trackIds.length === 1 ? 'song' : 'songs'}
                      </p>
                      {playlist.description && (
                        <p className="text-gray-500 text-xs mt-1 truncate">
                          {playlist.description}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
            
            {/* All Playlists */}
            {playlists.length > 6 && (
              <div>
                <h3 className="text-xl font-semibold text-white mb-4">All Playlists</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {playlists.map((playlist: Playlist) => (
                    <Card key={playlist._id} className="bg-spotify-light-gray hover:bg-gray-700 transition-colors cursor-pointer group">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Music className="w-8 h-8 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <Link href={`/playlist/${playlist._id}`}>
                              <h3 className="text-white font-medium truncate mb-1 hover:underline">
                                {playlist.name}
                              </h3>
                            </Link>
                            <p className="text-gray-400 text-sm truncate">
                              {playlist.trackIds.length} {playlist.trackIds.length === 1 ? 'song' : 'songs'}
                            </p>
                            {playlist.description && (
                              <p className="text-gray-500 text-xs mt-1 truncate">
                                {playlist.description}
                              </p>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-10 h-10 bg-spotify-green rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Play className="w-5 h-5 text-black ml-1" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <Music className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No playlists yet</h3>
            <p className="text-gray-400 mb-4">Create your first playlist to organize your music</p>
            <Button 
              onClick={() => setShowCreateDialog(true)}
              className="bg-spotify-green text-black hover:bg-spotify-light-green"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Playlist
            </Button>
          </div>
        )}
      </div>
    </main>
  );
}
