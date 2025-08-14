
import { useState } from "react";
import { Plus, Music } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AddToPlaylistDialogProps {
  isOpen: boolean;
  onClose: () => void;
  trackId: string;
  trackTitle?: string;
}

interface Playlist {
  _id: string;
  name: string;
  trackIds: string[];
}

export function AddToPlaylistDialog({ isOpen, onClose, trackId, trackTitle }: AddToPlaylistDialogProps) {
  const [selectedPlaylist, setSelectedPlaylist] = useState<string>("");
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [showCreateNew, setShowCreateNew] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: playlists = [] } = useQuery({
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
    enabled: isOpen,
  });

  const createPlaylistMutation = useMutation({
    mutationFn: async (name: string) => {
      const response = await fetch("/api/playlists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name,
          trackIds: [trackId],
          isPublic: false,
        }),
      });
      if (!response.ok) throw new Error("Failed to create playlist");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/playlists"] });
      toast({ title: `Created playlist "${newPlaylistName}" with track added!` });
      handleClose();
    },
    onError: () => {
      toast({ title: "Failed to create playlist", variant: "destructive" });
    },
  });

  const addToPlaylistMutation = useMutation({
    mutationFn: async (playlistId: string) => {
      const response = await fetch(`/api/playlists/${playlistId}/tracks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ trackId }),
      });
      if (!response.ok) throw new Error("Failed to add to playlist");
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/playlists"] });
      toast({ title: data.message || "Track added to playlist!" });
      handleClose();
    },
    onError: (error: any) => {
      toast({ 
        title: error.message || "Failed to add to playlist", 
        variant: "destructive" 
      });
    },
  });

  const handleClose = () => {
    setSelectedPlaylist("");
    setNewPlaylistName("");
    setShowCreateNew(false);
    onClose();
  };

  const handleSubmit = () => {
    if (showCreateNew) {
      if (!newPlaylistName.trim()) {
        toast({ title: "Please enter a playlist name", variant: "destructive" });
        return;
      }
      createPlaylistMutation.mutate(newPlaylistName.trim());
    } else {
      if (!selectedPlaylist) {
        toast({ title: "Please select a playlist", variant: "destructive" });
        return;
      }
      addToPlaylistMutation.mutate(selectedPlaylist);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-spotify-light-gray border-gray-700 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white">Add to Playlist</DialogTitle>
          {trackTitle && (
            <p className="text-gray-400 text-sm">Adding "{trackTitle}" to playlist</p>
          )}
        </DialogHeader>
        
        <div className="space-y-4">
          {!showCreateNew ? (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium text-white">Select Playlist</label>
                <Select value={selectedPlaylist} onValueChange={setSelectedPlaylist}>
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                    <SelectValue placeholder="Choose a playlist" />
                  </SelectTrigger>
                  <SelectContent className="bg-spotify-light-gray border-gray-700">
                    {playlists.length > 0 ? (
                      playlists.map((playlist: Playlist) => (
                        <SelectItem key={playlist._id} value={playlist._id} className="text-white hover:bg-gray-600">
                          <div className="flex items-center gap-2">
                            <Music className="w-4 h-4" />
                            <span>{playlist.name}</span>
                            <span className="text-gray-400 text-sm">({playlist.trackIds.length} songs)</span>
                          </div>
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-playlists" disabled className="text-gray-400">
                        No playlists available
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex justify-between gap-3">
                <Button
                  onClick={() => setShowCreateNew(true)}
                  variant="outline"
                  className="flex-1 border-gray-600 text-white hover:bg-gray-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  New Playlist
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={!selectedPlaylist || addToPlaylistMutation.isPending}
                  className="flex-1 bg-spotify-green text-black hover:bg-spotify-green/90"
                >
                  {addToPlaylistMutation.isPending ? "Adding..." : "Add"}
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium text-white">Playlist Name</label>
                <Input
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  placeholder="My Awesome Playlist"
                  className="bg-gray-700 border-gray-600 text-white"
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                />
              </div>
              
              <div className="flex justify-between gap-3">
                <Button
                  onClick={() => setShowCreateNew(false)}
                  variant="outline"
                  className="flex-1 border-gray-600 text-white hover:bg-gray-700"
                >
                  Back
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={!newPlaylistName.trim() || createPlaylistMutation.isPending}
                  className="flex-1 bg-spotify-green text-black hover:bg-spotify-green/90"
                >
                  {createPlaylistMutation.isPending ? "Creating..." : "Create & Add"}
                </Button>
              </div>
            </>
          )}
          
          <Button
            onClick={handleClose}
            variant="ghost"
            className="w-full text-gray-400 hover:text-white"
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
