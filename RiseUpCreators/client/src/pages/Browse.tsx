import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { TrackCard } from "@/components/music/TrackCard";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";

export default function Browse() {
  const [searchQuery, setSearchQuery] = useState("");
  const [, setLocation] = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const query = params.get("q");
    if (query) {
      setSearchQuery(query);
    }
  }, []);

  const { data: searchResults = [] } = useQuery({
    queryKey: ["/api/tracks/search", searchQuery],
    queryFn: async () => {
      if (!searchQuery.trim()) return [];
      const response = await fetch(`/api/tracks/search?q=${encodeURIComponent(searchQuery)}`);
      return response.json();
    },
    enabled: !!searchQuery.trim(),
  });

  const { data: trendingTracks = [] } = useQuery({
    queryKey: ["/api/tracks"],
    refetchInterval: false,
  });

  const tracksToShow = searchQuery.trim() ? searchResults : trendingTracks;

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      setLocation(`/browse?q=${encodeURIComponent(query)}`);
    } else {
      setLocation("/browse");
    }
  };

  return (
    <main className="flex-1 overflow-y-auto custom-scrollbar px-6 pb-24">
      <div className="mb-8">
        <h1 className="text-4xl font-poppins font-bold text-white mb-6">Browse Music</h1>

        <div className="relative max-w-xl">
          <Input
            type="text"
            placeholder="Search for tracks, artists, or albums..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-12 py-3 bg-white rounded-full text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-spotify-green border-0"
          />
          <Search className="w-5 h-5 text-gray-500 absolute left-4 top-1/2 transform -translate-y-1/2" />
        </div>
      </div>

      <section>
        <h2 className="text-2xl font-poppins font-bold text-white mb-6">
          {searchQuery.trim() ? `Search Results for "${searchQuery}"` : "Trending Now"}
        </h2>

        {tracksToShow.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {tracksToShow.map((track: any) => (
              <TrackCard key={track.id} track={track} />
            ))}
          </div>
        ) : searchQuery.trim() ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No tracks found for "{searchQuery}"</p>
            <p className="text-gray-500 mt-2">Try searching with different keywords</p>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No trending tracks available</p>
            <p className="text-gray-500 mt-2">Check back later or search for something new</p>
          </div>
        )}
      </section>
    </main>
  );
}