import { Shuffle, SkipBack, Play, Pause, SkipForward, Repeat, Mic2, List, Plus, Volume2, Heart, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { usePlayer } from "@/hooks/use-player";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { AddToPlaylistDialog } from "@/components/music/AddToPlaylistDialog";

export function NowPlayingBar() {
  const { currentTrack, isPlaying, togglePlayPause, volume, setVolume, currentTime, duration, seek, stopTrack } = usePlayer();
  const [isShuffled, setIsShuffled] = useState(false);
  const [repeatMode, setRepeatMode] = useState<'off' | 'one' | 'all'>('off');
  const [showQueue, setShowQueue] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [showPlaylistDialog, setShowPlaylistDialog] = useState(false);
  const { toast } = useToast();

  if (!currentTrack) {
    return null;
  }

  const handleShuffle = () => {
    setIsShuffled(!isShuffled);
    toast({ title: isShuffled ? "Shuffle off" : "Shuffle on" });
  };

  const handleRepeat = () => {
    const modes: ('off' | 'one' | 'all')[] = ['off', 'one', 'all'];
    const currentIndex = modes.indexOf(repeatMode);
    const nextMode = modes[(currentIndex + 1) % modes.length];
    setRepeatMode(nextMode);
    toast({
      title: nextMode === 'off' ? "Repeat off" :
             nextMode === 'one' ? "Repeat one" : "Repeat all"
    });
  };

  const handleSkipNext = () => {
    toast({ title: "Next track (not implemented yet)" });
  };

  const handleSkipPrevious = () => {
    toast({ title: "Previous track (not implemented yet)" });
  };

  const handleLike = async () => {
    try {
      const response = await fetch(`/api/tracks/${currentTrack.id}/like`, {
        method: "POST",
        credentials: "include",
      });
      if (response.ok) {
        setIsLiked(!isLiked);
        toast({ title: isLiked ? "Removed from liked songs" : "Added to liked songs" });
      }
    } catch (error) {
      toast({ title: "Failed to like track", variant: "destructive" });
    }
  };

  const handleShowLyrics = () => {
    toast({ title: "Lyrics feature coming soon!" });
  };

  const handleShowQueue = () => {
    setShowQueue(!showQueue);
    toast({ title: showQueue ? "Queue hidden" : "Queue shown" });
  };

  const handleDeviceSelect = () => {
    toast({ title: "Device selection coming soon!" });
  };

  const handleClose = () => {
    stopTrack();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <>
      <AddToPlaylistDialog
        isOpen={showPlaylistDialog}
        onClose={() => setShowPlaylistDialog(false)}
        trackId={currentTrack.id}
      />
      <div className="fixed bottom-0 left-0 right-0 bg-spotify-light-gray border-t border-gray-700 px-2 md:px-4 py-2 md:py-3 z-50">
        <div className="flex items-center justify-between">
          {/* Currently playing info */}
          <div className="flex items-center space-x-2 md:space-x-4 flex-1 min-w-0">
            <img
              src={currentTrack.coverUrl || "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=80"}
              alt={`Now playing: ${currentTrack.title}`}
              className="w-10 h-10 md:w-14 md:h-14 rounded object-cover"
            />
            <div className="min-w-0 hidden sm:block">
              <h4 className="text-white font-medium truncate text-sm md:text-base">{currentTrack.title}</h4>
              <p className="text-gray-400 text-xs md:text-sm truncate">{currentTrack.creator.username}</p>
            </div>
            <div className="flex items-center space-x-1 md:space-x-2">
              <Button
                variant="ghost"
                size="sm"
                className={`${isLiked ? "text-spotify-green" : "text-gray-400"} hover:text-white p-1 md:p-2`}
                onClick={handleLike}
              >
                <Heart className={`w-4 h-4 md:w-5 md:h-5 ${isLiked ? "fill-current" : ""}`} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-white p-1 md:p-2"
                onClick={handleClose}
              >
                <X className="w-3 h-3 md:w-4 md:h-4" />
              </Button>
            </div>
          </div>

          {/* Player controls */}
          <div className="flex flex-col items-center flex-1 max-w-2xl">
            <div className="flex items-center space-x-2 md:space-x-6 mb-1 md:mb-2">
              <Button
                variant="ghost"
                size="sm"
                className={`${isShuffled ? "text-spotify-green" : "text-gray-400"} hover:text-white hidden md:flex`}
                onClick={handleShuffle}
              >
                <Shuffle className="w-4 h-4 md:w-5 md:h-5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-white"
                onClick={handleSkipPrevious}
              >
                <SkipBack className="w-4 h-4 md:w-5 md:h-5" />
              </Button>
              <Button
                onClick={togglePlayPause}
                className="w-8 h-8 md:w-10 md:h-10 bg-white rounded-full flex items-center justify-center hover:scale-105 transition-transform"
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4 md:w-5 md:h-5 text-black" />
                ) : (
                  <Play className="w-4 h-4 md:w-5 md:h-5 text-black ml-0.5" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-white"
                onClick={handleSkipNext}
              >
                <SkipForward className="w-4 h-4 md:w-5 md:h-5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={`${repeatMode !== 'off' ? "text-spotify-green" : "text-gray-400"} hover:text-white hidden md:flex`}
                onClick={handleRepeat}
              >
                <Repeat className="w-4 h-4 md:w-5 md:h-5" />
                {repeatMode === 'one' && <span className="text-xs ml-1">1</span>}
              </Button>
            </div>

            {/* Progress bar */}
            <div className="flex items-center space-x-3 w-full">
              <span className="text-xs text-gray-400">{formatTime(currentTime)}</span>
              <div className="flex-1">
                <Slider
                  value={[progressPercentage]}
                  max={100}
                  step={0.1}
                  onValueChange={(value) => {
                    const newTime = (value[0] / 100) * duration;
                    seek(newTime);
                  }}
                  className="w-full"
                />
              </div>
              <span className="text-xs text-gray-400">{formatTime(duration)}</span>
            </div>
          </div>

          {/* Volume and additional controls */}
          <div className="flex items-center space-x-1 md:space-x-4 flex-1 justify-end">
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white hidden lg:flex"
              onClick={handleShowLyrics}
            >
              <Mic2 className="w-4 h-4 md:w-5 md:h-5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`${showQueue ? "text-spotify-green" : "text-gray-400"} hover:text-white hidden md:flex`}
              onClick={handleShowQueue}
            >
              <List className="w-4 h-4 md:w-5 md:h-5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white"
              onClick={() => setShowPlaylistDialog(true)}
            >
              <Plus className="w-4 h-4 md:w-5 md:h-5" />
            </Button>
            <div className="flex items-center space-x-2 hidden sm:flex">
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                <Volume2 className="w-4 h-4 md:w-5 md:h-5" />
              </Button>
              <div className="w-16 md:w-24">
                <Slider
                  value={[volume * 100]}
                  max={100}
                  step={1}
                  onValueChange={(value) => setVolume(value[0] / 100)}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}