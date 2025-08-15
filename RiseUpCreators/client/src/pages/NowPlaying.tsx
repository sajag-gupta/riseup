import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { ChevronDown, MoreVertical, Heart, Share, Download, Plus, Shuffle, SkipBack, Play, Pause, SkipForward, Repeat, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usePlayer } from "@/hooks/use-player";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Track {
  _id: string;
  title: string;
  artistName: string;
  album?: string;
  audioUrl: string;
  coverUrl?: string;
  videoUrl?: string;
  duration?: number;
  genre?: string;
  plays: number;
  isLiked?: boolean;
  createdAt: string;
}

export default function NowPlaying() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { currentTrack, isPlaying, playTrack, togglePlayPause } = usePlayer();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showVideo, setShowVideo] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  const { data: track, isLoading } = useQuery({
    queryKey: ["/api/tracks", id],
    queryFn: async () => {
      const response = await fetch(`/api/tracks/${id}`);
      if (!response.ok) throw new Error("Track not found");
      return response.json();
    },
    enabled: !!id,
  });

  const likeMutation = useMutation({
    mutationFn: async (trackId: string) => {
      const response = await fetch(`/api/tracks/${trackId}/like`, {
        method: "POST",
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to like track");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tracks", id] });
      toast({ title: "Added to liked songs!" });
    },
    onError: () => {
      toast({ title: "Failed to like track", variant: "destructive" });
    },
  });

  const shareTrack = async () => {
    if (navigator.share && track) {
      try {
        await navigator.share({
          title: track.title,
          text: `Listen to ${track.title} by ${track.artistName}`,
          url: window.location.href,
        });
      } catch (error) {
        // Fallback to clipboard
        navigator.clipboard.writeText(window.location.href);
        toast({ title: "Link copied to clipboard!" });
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({ title: "Link copied to clipboard!" });
    }
  };

  const downloadTrack = () => {
    if (track?.audioUrl) {
      const link = document.createElement("a");
      link.href = track.audioUrl;
      link.download = `${track.title} - ${track.artistName}.mp3`;
      link.click();
      toast({ title: "Download started!" });
    }
  };

  const handlePlayPause = () => {
    if (track) {
      if (!currentTrack || currentTrack.id !== track._id) {
        playTrack({
          id: track._id,
          title: track.title,
          creator: { username: track.artistName },
          coverUrl: track.coverUrl || "",
          audioUrl: track.audioUrl,
          duration: track.duration,
        });
      } else {
        togglePlayPause();
      }
    }
  };

  const isTrackPlaying = currentTrack?.id === track?._id && isPlaying;


  useEffect(() => {
    if (track && (!currentTrack || currentTrack.id !== track._id)) {
      // If track has video, show it automatically
      if (track.videoUrl) {
        setShowVideo(true);
      }

      playTrack({
        id: track._id,
        title: track.title,
        creator: { username: track.artistName },
        coverUrl: track.coverUrl || "",
        audioUrl: track.audioUrl,
        duration: track.duration,
      });
    }
  }, [track, currentTrack, playTrack]);

  // Handle video play state to mute audio track when video is playing
  useEffect(() => {
    if (isVideoPlaying && currentTrack?.id === track?._id) {
      // Pause the audio track when video is playing (video audio takes priority)
      const audioElements = document.querySelectorAll('audio');
      audioElements.forEach(audio => {
        if (!audio.paused) {
          audio.pause();
        }
      });
    }
  }, [isVideoPlaying, currentTrack, track]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-800 to-spotify-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-spotify-green mx-auto mb-4"></div>
          <p className="text-gray-400">Loading track...</p>
        </div>
      </div>
    );
  }

  if (!track) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-800 to-spotify-black text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Track not found</h2>
          <p className="text-gray-400 mb-4">The track you're looking for doesn't exist.</p>
          <Button onClick={() => setLocation("/")} className="bg-spotify-green text-black">
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  const trackToShow = track;
  const formatDuration = (seconds?: number) => {
    if (!seconds) return "0:00";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
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

  return (
    <main className="flex-1 overflow-y-auto custom-scrollbar pb-24">
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-spotify-black">
        {/* Header */}
        <div className="px-4 sm:px-6 py-6 sm:py-8">
          <Button
            onClick={() => setLocation("/")}
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/20 mb-6"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </Button>

          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              {/* Album Art */}
              <div className="flex justify-center">
                <div className="relative group">
                  <img
                    src={trackToShow.coverUrl || "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=500"}
                    alt={`${trackToShow.title} cover`}
                    className="w-64 h-64 sm:w-80 sm:h-80 object-cover rounded-xl shadow-2xl group-hover:shadow-3xl transition-shadow duration-300"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 rounded-xl" />
                </div>
              </div>

              {/* Track Info */}
              <div className="text-center lg:text-left">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 break-words">{trackToShow.title}</h1>
                <p className="text-xl sm:text-2xl text-gray-300 mb-2 break-words">{trackToShow.artistName}</p>
                {trackToShow.album && (
                  <p className="text-base sm:text-lg text-gray-400 mb-6 break-words">{trackToShow.album}</p>
                )}
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 sm:gap-6 mb-8">
                  <span className="text-gray-400 text-sm sm:text-base">{trackToShow.plays?.toLocaleString()} plays</span>
                  {trackToShow.duration && (
                    <span className="text-gray-400 text-sm sm:text-base">{Math.floor(trackToShow.duration / 60)}:{(trackToShow.duration % 60).toString().padStart(2, '0')}</span>
                  )}
                  {trackToShow.genre && (
                    <span className="text-gray-400 text-sm sm:text-base">{trackToShow.genre}</span>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 sm:gap-6">
                  <Button
                    onClick={handlePlayPause}
                    className="w-14 h-14 sm:w-16 sm:h-16 bg-spotify-green rounded-full flex items-center justify-center hover:scale-105 transition-transform"
                  >
                    {isTrackPlaying ? (
                      <Pause className="w-6 h-6 sm:w-8 sm:h-8 text-black" />
                    ) : (
                      <Play className="w-6 h-6 sm:w-8 sm:h-8 text-black ml-1" />
                    )}
                  </Button>

                  <Button
                    onClick={() => likeMutation.mutate(trackToShow._id)}
                    variant="ghost"
                    size="lg"
                    className="text-gray-300 hover:text-white hover:bg-gray-700/50"
                  >
                    <Heart className={`w-6 h-6 sm:w-8 sm:h-8 ${trackToShow.isLiked ? "fill-spotify-green text-spotify-green" : ""}`} />
                  </Button>

                  <Button
                    onClick={() => toast({ title: "Added to playlist!" })}
                    variant="ghost"
                    size="lg"
                    className="text-gray-300 hover:text-white hover:bg-gray-700/50"
                  >
                    <Plus className="w-6 h-6 sm:w-8 sm:h-8" />
                  </Button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="lg"
                        className="text-gray-300 hover:text-white hover:bg-gray-700/50"
                      >
                        <MoreVertical className="w-6 h-6 sm:w-8 sm:h-8" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-spotify-light-gray border-gray-700">
                      <DropdownMenuItem onClick={shareTrack} className="text-white hover:bg-gray-600">
                        <Share className="w-4 h-4 mr-2" />
                        Share
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={downloadTrack} className="text-white hover:bg-gray-600">
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Music Video Dialog */}
      <Dialog open={showVideo} onOpenChange={setShowVideo}>
        <DialogContent className="max-w-4xl bg-spotify-light-gray border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white">
              {trackToShow.title} - Music Video
            </DialogTitle>
          </DialogHeader>
          <div className="aspect-video">
            {trackToShow.videoUrl && (
              <video
                className="w-full h-full rounded-lg"
                controls
                autoPlay
                poster={trackToShow.coverUrl}
                onPlay={() => setIsVideoPlaying(true)}
                onPause={() => setIsVideoPlaying(false)}
                onEnded={() => setIsVideoPlaying(false)}
              >
                <source src={trackToShow.videoUrl} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}