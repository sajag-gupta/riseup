import { Play, MoreHorizontal, Plus, Heart, Pause, Share, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { usePlayer } from "@/hooks/use-player";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Link, useLocation } from "wouter";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { AddToPlaylistDialog } from "./AddToPlaylistDialog";

interface Track {
  id: string;
  title: string;
  creator: { username: string };
  coverUrl?: string;
  plays: number;
  audioUrl: string;
  duration?: number;
  album?: string;
  isLiked?: boolean;
}

interface TrackCardProps {
  track: Track;
  showInlinePlayer?: boolean;
}

export function TrackCard({ track, showInlinePlayer = false }: TrackCardProps) {
  const { currentTrack, isPlaying, playTrack, togglePlayPause } = usePlayer();
  const [isLiked, setIsLiked] = useState(track.isLiked || false);
  const [showPlaylistDialog, setShowPlaylistDialog] = useState(false);
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const likeMutation = useMutation({
    mutationFn: async (trackId: string) => {
      const response = await fetch(`/api/tracks/${trackId}/like`, {
        method: "POST",
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to like track");
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/tracks"] });
      setIsLiked(data.liked);
      toast({ title: data.message });
    },
    onError: () => {
      toast({ title: "Failed to like track", variant: "destructive" });
    },
  });

  const handlePlay = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    playTrack(track);
  };

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    likeMutation.mutate(track.id);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    const shareUrl = `${window.location.origin}/now-playing/${track.id}`;

    if (navigator.share) {
      navigator.share({
        title: track.title,
        text: `Listen to ${track.title} by ${track.creator.username}`,
        url: shareUrl,
      }).catch(() => {
        navigator.clipboard.writeText(shareUrl);
        toast({ title: "Link copied to clipboard!" });
      });
    } else {
      navigator.clipboard.writeText(shareUrl);
      toast({ title: "Link copied to clipboard!" });
    }
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    const link = document.createElement("a");
    link.href = track.audioUrl;
    link.download = `${track.title} - ${track.creator.username}.mp3`;
    link.click();
    toast({ title: "Download started!" });
  };

  const handleAddToPlaylist = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowPlaylistDialog(true);
  };

  const handleCardClick = () => {
    setLocation(`/now-playing/${track.id}`);
  };

  const formatPlays = (plays: number) => {
    if (plays >= 1000000) {
      return `${(plays / 1000000).toFixed(1)}M`;
    }
    if (plays >= 1000) {
      return `${(plays / 1000).toFixed(0)}K`;
    }
    return plays.toString();
  };

  const isCurrentTrack = currentTrack?.id === track.id;
  const isTrackPlaying = isCurrentTrack && isPlaying;

  return (
    <>
      <AddToPlaylistDialog
        isOpen={showPlaylistDialog}
        onClose={() => setShowPlaylistDialog(false)}
        trackId={track.id}
        trackTitle={track.title}
      />
      <div className={`group relative bg-spotify-light-gray hover:bg-gray-700 rounded-lg p-3 md:p-4 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-spotify-green/20 hover-lift animate-bounce-in`}>
      <div className="relative">
        <img
          src={track.coverUrl || "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300"}
          alt={track.title}
          className="w-full aspect-square object-cover rounded-lg mb-3 md:mb-4 transition-transform duration-300 group-hover:scale-110"
        />

        {/* Play button overlay */}
        <button
          onClick={handlePlay}
          className="absolute bottom-2 right-2 w-10 h-10 md:w-12 md:h-12 bg-spotify-green rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 shadow-lg hover:shadow-2xl hover:scale-110 animate-glow"
        >
          {isCurrentTrack && isPlaying ? (
            <Pause className="w-4 h-4 md:w-6 md:h-6 text-black" />
          ) : (
            <Play className="w-4 h-4 md:w-6 md:h-6 text-black ml-0.5" />
          )}
        </button>
      </div>

      <div className="space-y-1">
        <h3 className="font-semibold text-white truncate text-sm md:text-base" title={track.title}>
          {track.title}
        </h3>
        <p className="text-xs md:text-sm text-gray-400 truncate" title={track.creator.username}>
          {track.creator.username}
        </p>
      </div>

      {/* Action buttons */}
      <div className="flex items-center justify-between mt-2 md:mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="flex items-center space-x-1 md:space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLike}
            className={`p-1 ${isLiked ? "text-spotify-green" : "text-gray-400"} hover:text-white`}
          >
            <Heart className={`w-3 h-3 md:w-4 md:h-4 ${isLiked ? "fill-current" : ""}`} />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="p-1 h-8 w-8 text-gray-400 hover:text-white hover:bg-gray-600"
              >
                <MoreHorizontal className="w-3 h-3 md:w-4 md:h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-spotify-light-gray border-gray-700">
              <DropdownMenuItem onClick={handleLike} className="text-white hover:bg-gray-600">
                <Heart className="w-4 h-4 mr-2" />
                {isLiked ? "Remove from Liked" : "Add to Liked"}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleShare} className="text-white hover:bg-gray-600">
                <Share className="w-4 h-4 mr-2" />
                Share
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDownload} className="text-white hover:bg-gray-600">
                <Download className="w-4 h-4 mr-2" />
                Download
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleAddToPlaylist} className="text-white hover:bg-gray-600">
                <Plus className="w-4 h-4 mr-2" />
                Add to Playlist
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {track.plays && (
          <span className="text-xs text-gray-500">
            {formatPlays(track.plays)} plays
          </span>
        )}
      </div>
    </div>
    </>
  );
}