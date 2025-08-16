
import { useState } from "react";
import { Heart, Music, Play, Shuffle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TrackCard } from "@/components/music/TrackCard";
import { useQuery } from "@tanstack/react-query";
import { usePlayer } from "@/hooks/use-player";

interface LikedTrack {
  _id: string;
  title: string;
  artistName: string;
  album?: string;
  audioUrl: string;
  coverUrl?: string;
  duration?: number;
  plays: number;
  likedAt: string;
}

export default function LikedSongs() {
  const { playTrack } = usePlayer();

  const { data: likedTracks = [], isLoading } = useQuery({
    queryKey: ["/api/liked-songs"],
    queryFn: async () => {
      const response = await fetch("/api/liked-songs", {
        credentials: "include",
      });
      if (!response.ok) {
        if (response.status === 401) return [];
        throw new Error("Failed to fetch liked songs");
      }
      return response.json();
    },
  });

  const handlePlayAll = () => {
    if (likedTracks.length > 0) {
      const firstTrack = likedTracks[0];
      playTrack({
        id: firstTrack._id,
        title: firstTrack.title,
        creator: { username: firstTrack.artistName },
        coverUrl: firstTrack.coverUrl || "",
        audioUrl: firstTrack.audioUrl,
        duration: firstTrack.duration,
      });
    }
  };

  const handleShufflePlay = () => {
    if (likedTracks.length > 0) {
      const randomIndex = Math.floor(Math.random() * likedTracks.length);
      const randomTrack = likedTracks[randomIndex];
      playTrack({
        id: randomTrack._id,
        title: randomTrack.title,
        creator: { username: randomTrack.artistName },
        coverUrl: randomTrack.coverUrl || "",
        audioUrl: randomTrack.audioUrl,
        duration: randomTrack.duration,
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-spotify-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-spotify-green mx-auto mb-4"></div>
          <p className="text-gray-400">Loading your liked songs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar pb-24">
      {/* Header */}
      <div className="bg-gradient-to-b from-purple-800 to-spotify-black px-4 md:px-6 py-6 md:py-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center md:items-end gap-4 md:gap-6">
          <div className="w-32 h-32 md:w-48 md:h-48 lg:w-60 lg:h-60 bg-gradient-to-br from-purple-400 to-blue-600 rounded-lg flex items-center justify-center shadow-2xl">
            <Heart className="w-8 h-8 md:w-12 md:h-12 lg:w-16 lg:h-16 text-white fill-current" />
          </div>
          <div className="text-center md:text-left">
            <p className="text-xs md:text-sm text-white/80 mb-1 md:mb-2">Playlist</p>
            <h1 className="text-2xl md:text-4xl lg:text-6xl font-bold text-white mb-1 md:mb-2 lg:mb-4">Liked Songs</h1>
            <p className="text-sm md:text-base text-white/80">
              {likedTracks.length} {likedTracks.length === 1 ? 'song' : 'songs'}
            </p>
          </div>
        </div>
      </div>

      {/* Controls */}
      {likedTracks.length > 0 && (
        <div className="px-4 md:px-6 py-3 md:py-4">
          <div className="flex items-center gap-3 md:gap-4">
            <Button
              onClick={handlePlayAll}
              className="w-10 h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 bg-spotify-green rounded-full flex items-center justify-center"
            >
              <Play className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 text-black ml-1" />
            </Button>
            <Button
              onClick={handleShufflePlay}
              variant="ghost"
              size="sm"
              className="text-gray-300 hover:text-white p-2 md:p-3"
            >
              <Shuffle className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6" />
            </Button>
          </div>
        </div>
      )}

      {/* Tracks */}
      <div className="px-4 md:px-6 pb-8">
        {likedTracks.length > 0 ? (
          <div className="space-y-1 md:space-y-2">
            {/* Table Header */}
            <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-2 text-sm text-gray-400 border-b border-gray-700">
              <div className="col-span-1">#</div>
              <div className="col-span-6">Title</div>
              <div className="col-span-3">Album</div>
              <div className="col-span-2">Duration</div>
            </div>
            
            {likedTracks.map((track: LikedTrack, index: number) => (
              <div key={track._id} className="flex md:grid md:grid-cols-12 items-center gap-2 md:gap-4 p-2 md:p-4 rounded-lg hover:bg-gray-800/50 group">
                <span className="text-gray-400 w-6 md:w-8 text-center text-sm md:text-base group-hover:hidden md:col-span-1">
                  {index + 1}
                </span>
                <Button
                  onClick={() => playTrack({
                    id: track._id,
                    title: track.title,
                    creator: { username: track.artistName },
                    coverUrl: track.coverUrl || "",
                    audioUrl: track.audioUrl,
                    duration: track.duration,
                  })}
                  variant="ghost"
                  size="sm"
                  className="w-6 h-6 md:w-8 md:h-8 hidden group-hover:flex items-center justify-center text-white hover:bg-gray-600 md:col-span-1"
                >
                  <Play className="w-3 h-3 md:w-4 md:h-4" />
                </Button>
                
                {/* Track Info */}
                <div className="flex items-center gap-3 flex-1 md:col-span-6">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg overflow-hidden bg-gray-700 flex-shrink-0">
                    {track.coverUrl ? (
                      <img src={track.coverUrl} alt={track.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Music className="w-4 h-4 md:w-6 md:h-6 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-white font-medium truncate">{track.title}</p>
                    <p className="text-gray-400 text-sm truncate">{track.artistName}</p>
                  </div>
                </div>
                
                {/* Album (Desktop only) */}
                <div className="hidden md:block md:col-span-3">
                  <p className="text-gray-400 text-sm truncate">{track.album || "Single"}</p>
                </div>
                
                {/* Duration (Desktop only) */}
                <div className="hidden md:block md:col-span-2">
                  <p className="text-gray-400 text-sm">
                    {track.duration ? Math.floor(track.duration / 60) + ":" + String(track.duration % 60).padStart(2, "0") : "0:00"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No liked songs yet</h3>
            <p className="text-gray-400 mb-4">Start liking songs to see them here</p>
            <Button 
              onClick={() => window.location.href = "/browse"}
              className="bg-spotify-green text-black hover:bg-spotify-light-green"
            >
              Browse Music
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
