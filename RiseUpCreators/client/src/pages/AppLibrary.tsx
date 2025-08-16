
import { useState } from "react";
import { Play, Search, Filter, Music } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { usePlayer } from "@/hooks/use-player";

interface Track {
  _id: string;
  title: string;
  creator: { username: string };
  coverUrl?: string;
  audioUrl: string;
  duration?: number;
  plays: number;
  genre?: string;
  album?: string;
}

export default function AppLibrary() {
  const { playTrack } = usePlayer();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState<string>("all");

  const { data: tracks = [], isLoading } = useQuery({
    queryKey: ["/api/tracks"],
    queryFn: async () => {
      const response = await fetch("/api/tracks", {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch tracks");
      return response.json();
    },
  });

  const handlePlayTrack = (track: Track) => {
    playTrack({
      id: track._id,
      title: track.title,
      creator: track.creator,
      coverUrl: track.coverUrl || "",
      audioUrl: track.audioUrl,
      duration: track.duration,
    });
  };

  // Filter tracks based on search and genre
  const filteredTracks = tracks.filter((track: Track) => {
    const matchesSearch = track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         track.creator.username.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGenre = selectedGenre === "all" || track.genre === selectedGenre;
    return matchesSearch && matchesGenre;
  });

  // Get unique genres for filter
  const genres = ["all", ...Array.from(new Set(tracks.map((track: Track) => track.genre).filter(Boolean)))];

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen bg-spotify-black">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-spotify-green mx-auto mb-4"></div>
          <p className="text-gray-400">Loading tracks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar pb-20 sm:pb-24">
      {/* Header */}
      <div className="bg-gradient-to-b from-purple-800 to-spotify-black px-4 md:px-6 py-6 md:py-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl md:text-4xl lg:text-6xl font-bold text-white mb-2 md:mb-4">App Library</h1>
          <p className="text-white/80 text-sm md:text-base mb-4 md:mb-6">
            Default songs available in the app • {filteredTracks.length} tracks
          </p>
          
          {/* Search and Filter Controls */}
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
            <div className="relative flex-1 max-w-full sm:max-w-md">
              <Input
                type="text"
                placeholder="Search tracks, artists..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 md:py-3 bg-white/95 border-0 rounded-full text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-spotify-green text-sm md:text-base"
              />
              <Search className="w-4 h-4 md:w-5 md:h-5 text-gray-500 absolute left-3 top-1/2 transform -translate-y-1/2" />
            </div>
            
            <Select value={selectedGenre} onValueChange={setSelectedGenre}>
              <SelectTrigger className="w-full sm:w-48 bg-white/95 border-0 text-black rounded-full text-sm md:text-base">
                <Filter className="w-4 h-4 mr-2 flex-shrink-0" />
                <SelectValue placeholder="All Genres" />
              </SelectTrigger>
              <SelectContent>
                {genres.map((genre) => (
                  <SelectItem key={genre} value={genre}>
                    {genre === "all" ? "All Genres" : genre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Tracks List */}
      <div className="px-4 md:px-6 py-4 md:py-6 max-w-6xl mx-auto">
        {filteredTracks.length > 0 ? (
          <div className="space-y-1 md:space-y-2">
            {/* Desktop Header */}
            <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-2 text-sm text-gray-400 border-b border-gray-700">
              <div className="col-span-1">#</div>
              <div className="col-span-6">Title</div>
              <div className="col-span-3">Album</div>
              <div className="col-span-2">Duration</div>
            </div>
            
            {filteredTracks.map((track: Track, index: number) => (
              <div 
                key={track._id}
                className="flex md:grid md:grid-cols-12 items-center gap-2 md:gap-4 p-2 md:p-4 rounded-lg hover:bg-gray-800/50 group cursor-pointer"
                onClick={() => handlePlayTrack(track)}
              >
                {/* Mobile Layout */}
                <div className="flex items-center gap-3 flex-1 md:hidden">
                  <div className="w-8 flex items-center justify-center text-gray-400 group-hover:text-white flex-shrink-0">
                    <span className="group-hover:hidden text-sm">{index + 1}</span>
                    <Play className="w-3 h-3 hidden group-hover:block" />
                  </div>
                  
                  <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-700 flex-shrink-0">
                    {track.coverUrl ? (
                      <img src={track.coverUrl} alt={track.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-spotify-green to-creator-orange flex items-center justify-center">
                        <Music className="w-5 h-5 text-white" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate text-sm">{track.title}</p>
                    <div className="flex items-center gap-2">
                      <p className="text-gray-400 text-xs truncate">{track.creator.username}</p>
                      {track.genre && (
                        <Badge variant="secondary" className="text-xs">
                          {track.genre}
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end flex-shrink-0">
                    <span className="text-gray-400 text-xs">
                      {track.duration ? Math.floor(track.duration / 60) + ":" + String(track.duration % 60).padStart(2, "0") : "0:00"}
                    </span>
                    <span className="text-gray-400 text-xs">{track.plays} plays</span>
                  </div>
                </div>

                {/* Desktop Layout */}
                <div className="hidden md:contents">
                  <div className="col-span-1 flex items-center justify-center">
                    <span className="text-gray-400 group-hover:hidden">
                      {index + 1}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-8 h-8 hidden group-hover:flex items-center justify-center text-white hover:bg-gray-600"
                    >
                      <Play className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div className="flex items-center gap-3 col-span-6">
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-700">
                      {track.coverUrl ? (
                        <img src={track.coverUrl} alt={track.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-spotify-green to-creator-orange flex items-center justify-center">
                          <Music className="w-6 h-6 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-white font-medium truncate">{track.title}</p>
                      <div className="flex items-center gap-2">
                        <p className="text-gray-400 text-sm truncate">{track.creator.username}</p>
                        {track.genre && (
                          <Badge variant="secondary" className="text-xs">
                            {track.genre}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="col-span-3">
                    <p className="text-gray-400 text-sm truncate">{track.album || "Single"}</p>
                    <p className="text-gray-400 text-xs">{track.plays} plays</p>
                  </div>
                  
                  <div className="col-span-2">
                    <p className="text-gray-400 text-sm">
                      {track.duration ? Math.floor(track.duration / 60) + ":" + String(track.duration % 60).padStart(2, "0") : "0:00"}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 md:py-16">
            <Music className="w-16 h-16 md:w-20 md:h-20 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl md:text-2xl font-semibold text-white mb-2">
              {searchQuery.trim() || selectedGenre !== "all" ? "No tracks found" : "No tracks available"}
            </h3>
            <p className="text-gray-400 mb-6 text-sm md:text-base">
              {searchQuery.trim() || selectedGenre !== "all" 
                ? "Try adjusting your search or filter criteria" 
                : "Check back later for new music"
              }
            </p>
            {(searchQuery.trim() || selectedGenre !== "all") && (
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  onClick={() => setSearchQuery("")}
                  variant="outline"
                  className="border-gray-600 text-gray-300 hover:text-white hover:bg-gray-700"
                >
                  Clear Search
                </Button>
                <Button
                  onClick={() => setSelectedGenre("all")}
                  variant="outline"
                  className="border-gray-600 text-gray-300 hover:text-white hover:bg-gray-700"
                >
                  Show All Genres
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
