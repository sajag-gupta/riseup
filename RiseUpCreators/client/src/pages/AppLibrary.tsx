
import { useState, useEffect } from "react";
import { Play, Heart, MoreHorizontal, Music, Share, Download, Plus, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { usePlayer } from "@/hooks/use-player";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Track {
  _id: string;
  title: string;
  artistName: string;
  album?: string;
  genre?: string;
  audioUrl: string;
  coverUrl?: string;
  duration?: number;
  isAdminTrack: boolean;
  creator: { username: string };
}

export default function AppLibrary() {
  const { playTrack } = usePlayer();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState<string>("all");

  // Initialize default tracks when component mounts
  useEffect(() => {
    fetch("/api/init-default")
      .then(response => response.json())
      .catch(error => console.log("Default tracks initialization:", error));
  }, []);

  const { data: tracks = [], isLoading, refetch } = useQuery({
    queryKey: ["/api/tracks"],
    queryFn: async () => {
      const response = await fetch("/api/tracks");
      if (!response.ok) throw new Error("Failed to fetch tracks");
      return response.json();
    },
    staleTime: 0, // Always fetch fresh data
    refetchOnWindowFocus: false, // Prevent auto-refresh
  });

  const handlePlayTrack = (track: Track) => {
    playTrack({
      id: track._id,
      title: track.title,
      creator: { username: track.artistName },
      coverUrl: track.coverUrl || "",
      audioUrl: track.audioUrl,
      duration: track.duration
    });
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return "0:00";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <main className="flex-1 overflow-y-auto custom-scrollbar px-6 pb-24">
        <div className="mb-8">
          <h1 className="text-4xl font-poppins font-bold text-white mb-6">App Library</h1>
          <div className="text-gray-400">Loading tracks...</div>
        </div>
      </main>
    );
  }

  // Filter only admin tracks for app library
  let appLibraryTracks = tracks.filter((track: Track) => track.isAdminTrack);

  // Apply search filter
  if (searchQuery.trim()) {
    appLibraryTracks = appLibraryTracks.filter((track: Track) =>
      track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      track.artistName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (track.album && track.album.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (track.genre && track.genre.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }

  // Apply genre filter
  if (selectedGenre !== "all") {
    appLibraryTracks = appLibraryTracks.filter((track: Track) =>
      track.genre && track.genre.toLowerCase() === selectedGenre.toLowerCase()
    );
  }

  // Get unique genres for filter dropdown
  const availableGenres = [...new Set(tracks
    .filter((track: Track) => track.isAdminTrack && track.genre)
    .map((track: Track) => track.genre)
  )].filter(Boolean);

  return (
    <main className="flex-1 overflow-y-auto custom-scrollbar px-6 pb-24">
      <div className="mb-8">
        <h1 className="text-4xl font-poppins font-bold text-white mb-6">App Library</h1>
        <p className="text-gray-400 mb-6">Default songs available in the app</p>
        
        {/* Search and Filter Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Input
              type="text"
              placeholder="Search tracks, artists, albums..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-spotify-light-gray border-gray-600 text-white placeholder-gray-400 focus:border-spotify-green"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          </div>
          
          <Select value={selectedGenre} onValueChange={setSelectedGenre}>
            <SelectTrigger className="w-48 bg-spotify-light-gray border-gray-600 text-white">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filter by genre" />
            </SelectTrigger>
            <SelectContent className="bg-spotify-light-gray border-gray-600">
              <SelectItem value="all" className="text-white hover:bg-gray-600">All Genres</SelectItem>
              {availableGenres.map((genre) => (
                <SelectItem key={genre} value={genre!.toLowerCase()} className="text-white hover:bg-gray-600 capitalize">
                  {genre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          
        </div>
        
        {appLibraryTracks.length > 0 && (
          <div className="flex items-center gap-4 mb-6">
            <Button 
              onClick={() => handlePlayTrack(appLibraryTracks[0])}
              className="bg-spotify-green text-black px-8 py-3 rounded-full font-semibold hover:bg-spotify-light-green transition-colors flex items-center space-x-2"
            >
              <Play className="w-5 h-5" />
              <span>Play All</span>
            </Button>
            <span className="text-gray-400 text-sm">
              {appLibraryTracks.length} track{appLibraryTracks.length !== 1 ? 's' : ''}
              {searchQuery && ` found for "${searchQuery}"`}
              {selectedGenre !== "all" && ` in ${selectedGenre}`}
            </span>
          </div>
        )}
      </div>

      {/* Tracks List */}
      <section>
        {appLibraryTracks.length > 0 ? (
          <div className="bg-spotify-light-gray/30 rounded-lg overflow-hidden">
            <div className="grid grid-cols-[auto_1fr_1fr_auto_auto] gap-4 p-4 text-gray-400 text-sm font-medium border-b border-gray-700">
              <div className="w-12">#</div>
              <div>Title</div>
              <div>Album</div>
              <div>Duration</div>
              <div className="w-12"></div>
            </div>
            
            {appLibraryTracks.map((track: Track, index: number) => (
              <div
                key={track._id}
                className="grid grid-cols-[auto_1fr_1fr_auto_auto] gap-4 p-4 hover:bg-spotify-light-gray/50 transition-colors group cursor-pointer"
                onClick={() => handlePlayTrack(track)}
              >
                <div className="w-12 flex items-center justify-center text-gray-400 group-hover:text-white">
                  <span className="group-hover:hidden">{index + 1}</span>
                  <Play className="w-4 h-4 hidden group-hover:block" />
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-spotify-green to-creator-orange rounded flex items-center justify-center cursor-pointer hover:scale-105 transition-transform"
                       onClick={(e) => {
                         e.stopPropagation();
                         window.location.href = `/now-playing/${track._id}`;
                       }}>
                    {track.coverUrl ? (
                      <img src={track.coverUrl} alt={track.title} className="w-12 h-12 rounded object-cover" />
                    ) : (
                      <Music className="w-6 h-6 text-white" />
                    )}
                  </div>
                  <div>
                    <Link href={`/now-playing/${track._id}`}>
                      <h3 className="text-white font-medium hover:underline">{track.title}</h3>
                    </Link>
                    <p className="text-gray-400 text-sm">{track.artistName}</p>
                  </div>
                </div>
                
                <div className="flex items-center text-gray-400">
                  {track.album || "—"}
                </div>
                
                <div className="flex items-center text-gray-400">
                  {formatDuration(track.duration)}
                </div>
                
                <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-gray-400 hover:text-white hover:text-spotify-green"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Add to liked songs functionality
                      fetch(`/api/tracks/${track._id}/like`, {
                        method: "POST",
                        credentials: "include",
                      }).then(() => {
                        // Show success message
                        console.log("Added to liked songs");
                      });
                    }}
                  >
                    <Heart className="w-4 h-4" />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-gray-400 hover:text-white"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-spotify-light-gray border-gray-700">
                      <DropdownMenuItem 
                        className="text-white hover:bg-gray-600"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Share functionality
                          const shareUrl = `${window.location.origin}/now-playing/${track._id}`;
                          navigator.clipboard.writeText(shareUrl);
                          console.log("Link copied to clipboard");
                        }}
                      >
                        <Share className="w-4 h-4 mr-2" />
                        Share
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-white hover:bg-gray-600"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Download functionality
                          const link = document.createElement("a");
                          link.href = track.audioUrl;
                          link.download = `${track.title} - ${track.artistName}.mp3`;
                          link.click();
                        }}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-white hover:bg-gray-600"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Add to playlist functionality
                          console.log("Added to playlist");
                        }}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add to Playlist
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Music className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            {searchQuery || selectedGenre !== "all" ? (
              <>
                <p className="text-gray-400 text-lg">No tracks found</p>
                <p className="text-gray-500 mt-2">
                  Try adjusting your search or filter criteria
                </p>
                <Button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedGenre("all");
                  }}
                  variant="outline"
                  className="mt-4 border-gray-600 text-white hover:bg-gray-700"
                >
                  Clear Filters
                </Button>
              </>
            ) : (
              <>
                <p className="text-gray-400 text-lg">No tracks in app library</p>
                <p className="text-gray-500 mt-2">Admin needs to add default tracks</p>
              </>
            )}
          </div>
        )}
      </section>
    </main>
  );
}
