
import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { TrackCard } from "@/components/music/TrackCard";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Music } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Track {
  _id: string;
  title: string;
  artistName: string;
  album?: string;
  genre?: string;
  audioUrl: string;
  coverUrl?: string;
  duration?: number;
  plays: number;
  creator: { username: string };
}

export default function Genre() {
  const { genre } = useParams<{ genre: string }>();
  const [, setLocation] = useLocation();

  const { data: tracks = [], isLoading } = useQuery({
    queryKey: ["/api/tracks/search", genre],
    queryFn: async () => {
      // Map URL genre to proper format
      const genreMap: Record<string, string> = {
        'hiphop': 'Hip Hop',
        'hip-hop': 'Hip Hop',
        'r&b': 'R&B',
        'rnb': 'R&B'
      };
      
      const searchGenre = genreMap[genre?.toLowerCase() || ''] || genre;
      const response = await fetch(`/api/tracks/search?genre=${encodeURIComponent(searchGenre || '')}`);
      if (!response.ok) throw new Error("Failed to fetch tracks");
      return response.json();
    },
    enabled: !!genre,
  });

  const genreColors: Record<string, string> = {
    rock: "from-red-600 to-red-800",
    electronic: "from-purple-600 to-purple-800", 
    folk: "from-green-600 to-green-800",
    "hip hop": "from-orange-600 to-orange-800",
    jazz: "from-blue-600 to-blue-800",
    pop: "from-pink-600 to-pink-800",
  };

  const bgGradient = genreColors[genre?.toLowerCase() || ''] || "from-gray-600 to-gray-800";

  if (isLoading) {
    return (
      <div className="min-h-screen bg-spotify-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-spotify-green mx-auto mb-4"></div>
          <p className="text-gray-400">Loading {genre} tracks...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="flex-1 overflow-y-auto custom-scrollbar pb-24 pt-16 md:pt-0">
      {/* Header */}
      <div className={`bg-gradient-to-b ${bgGradient} px-4 md:px-6 py-8 md:py-12 relative`}>
        <Button
          onClick={() => setLocation("/")}
          variant="ghost"
          size="sm"
          className="absolute top-4 left-4 text-white hover:bg-white/20"
        >
          <ArrowLeft className="w-4 h-4 md:w-5 md:h-5 mr-2" />
          Back
        </Button>
        
        <div className="max-w-6xl mx-auto pt-8 md:pt-8">
          <p className="text-sm text-white/80 mb-2">Genre</p>
          <h1 className="text-3xl md:text-4xl lg:text-6xl font-bold text-white capitalize mb-4">{genre}</h1>
          <p className="text-white/80">{tracks.length} tracks available</p>
        </div>
      </div>

      {/* Tracks Grid */}
      <div className="px-4 md:px-6 py-6 md:py-8">
        {tracks.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
            {tracks.map((track: Track) => (
              <TrackCard key={track._id} track={{
                id: track._id,
                title: track.title,
                creator: { username: track.artistName },
                coverUrl: track.coverUrl,
                audioUrl: track.audioUrl,
                duration: track.duration,
                plays: track.plays,
                isLiked: false
              }} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Music className="w-12 h-12 md:w-16 md:h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg md:text-xl font-semibold text-white mb-2">No {genre} tracks found</h3>
            <p className="text-gray-400">Check back later for new releases</p>
          </div>
        )}
      </div>
    </main>
  );
}
