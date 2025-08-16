import { Play, Music, Zap, Leaf, Mic2, Music2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TrackCard } from "@/components/music/TrackCard";
import { TrackList } from "@/components/music/TrackList";
import { GenreCard } from "@/components/music/GenreCard";
import { CreatorCard } from "@/components/creators/CreatorCard";
import { ProductCard } from "@/components/shop/ProductCard";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";

export default function Home() {
  const [, setLocation] = useLocation();

  const { data: trendingTracks = [] } = useQuery({
    queryKey: ["/api/tracks"],
    queryFn: async () => {
      const response = await fetch("/api/tracks");
      if (!response.ok) throw new Error("Failed to fetch tracks");
      return response.json();
    },
  });

  const { data: featuredCreators = [] } = useQuery({
    queryKey: ["/api/creators/featured"],
    queryFn: async () => {
      // Mock data for now since no API endpoint exists
      return [];
    },
  });

  const { data: featuredProducts = [] } = useQuery({
    queryKey: ["/api/products/featured"],
    queryFn: async () => {
      // Mock data for now since no API endpoint exists
      return [];
    },
  });

  const genres = [
    { name: "Rock", icon: Music, gradient: "bg-gradient-to-br from-red-500 to-red-700", path: "/genre/Rock" },
    { name: "Electronic", icon: Zap, gradient: "bg-gradient-to-br from-purple-500 to-purple-700", path: "/genre/Electronic" },
    { name: "Folk", icon: Leaf, gradient: "bg-gradient-to-br from-green-500 to-green-700", path: "/genre/Folk" },
    { name: "Hip Hop", icon: Mic2, gradient: "bg-gradient-to-br from-yellow-500 to-orange-500", path: "/genre/Hip Hop" },
    { name: "Jazz", icon: Music2, gradient: "bg-gradient-to-br from-blue-500 to-blue-700", path: "/genre/Jazz" },
    { name: "Pop", icon: Star, gradient: "bg-gradient-to-br from-pink-500 to-pink-700", path: "/genre/Pop" },
  ];

  // Mock recent tracks for demo
  const recentTracks = trendingTracks.slice(0, 3);

  return (
    <main className="flex-1 overflow-y-auto custom-scrollbar px-4 md:px-6 pb-24 pt-16 md:pt-6">
      {/* Hero Section */}
      <section className="mb-6 md:mb-8 animate-fade-in">
        <div className="relative overflow-hidden rounded-xl hero-gradient p-6 md:p-12 mb-6 md:mb-8 hover:scale-[1.02] transition-transform duration-500">
          <div className="relative z-10">
            <h1 className="text-3xl md:text-4xl lg:text-6xl font-poppins font-bold mb-4 text-white animate-slide-in-left">
              Stream. Create. <span className="text-black animate-pulse">Connect.</span>
            </h1>
            <p className="text-base md:text-lg lg:text-xl text-white/90 mb-6 md:mb-8 max-w-2xl animate-slide-in-left" style={{ animationDelay: '0.2s' }}>
              Discover amazing music from independent creators worldwide. Support artists directly and find your next favorite song.
            </p>
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 animate-slide-in-left" style={{ animationDelay: '0.4s' }}>
              <Button className="bg-white text-black px-6 md:px-8 py-3 md:py-4 rounded-full font-semibold hover:scale-110 transition-all duration-300 flex items-center justify-center space-x-2 hover:shadow-2xl hover:shadow-white/20 group">
                <Play className="w-4 md:w-5 h-4 md:h-5 group-hover:animate-bounce" />
                <span>Start Listening</span>
              </Button>
              <Button
                variant="outline"
                className="bg-black/20 backdrop-blur text-white border border-white/30 px-6 md:px-8 py-3 md:py-4 rounded-full font-semibold hover:bg-black/30 hover:scale-110 transition-all duration-300 flex items-center justify-center space-x-2 hover:shadow-2xl hover:shadow-spotify-green/20 group"
              >
                <Mic2 className="w-4 md:w-5 h-4 md:h-5 group-hover:animate-bounce" />
                <span>Join as Creator</span>
              </Button>
            </div>
          </div>
          {/* Decorative Elements */}
          <div className="absolute top-4 right-4 opacity-20 animate-float">
            <div className="flex space-x-1">
              {[0, 0.1, 0.2, 0.3, 0.4].map((delay, i) => (
                <div
                  key={i}
                  className="w-3 bg-white music-wave animate-wave"
                  style={{ animationDelay: `${delay}s` }}
                />
              ))}
            </div>
          </div>
          {/* Floating particles */}
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-white/10 rounded-full animate-float"
                style={{
                  left: `${20 + i * 15}%`,
                  top: `${30 + (i % 2) * 40}%`,
                  animationDelay: `${i * 0.5}s`,
                  animationDuration: `${3 + i * 0.5}s`,
                }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Trending Tracks Section */}
      <section className="mb-8 animate-slide-in-up" style={{ animationDelay: '0.6s' }}>
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <h2 className="text-xl md:text-2xl font-bold text-white hover:text-spotify-green transition-colors duration-300 cursor-pointer">Trending Now</h2>
          <Button variant="link" className="text-gray-400 hover:text-white p-0 text-sm hover:scale-105 transition-all duration-300">
            Show all
          </Button>
        </div>
        <div className="relative">
          <div className="flex overflow-x-auto scrollbar-hide gap-4 pb-4">
            {trendingTracks.slice(0, 10).map((track: any) => (
              <div key={track._id} className="flex-shrink-0 w-48">
                <TrackCard
                  track={{
                    id: track._id,
                    title: track.title,
                    creator: { username: track.artistName },
                    coverUrl: track.coverUrl,
                    audioUrl: track.audioUrl,
                    duration: track.duration,
                    plays: track.plays,
                    isLiked: false
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Genre Categories Section */}
      <section className="mb-6 md:mb-8 animate-slide-in-up" style={{ animationDelay: '1.4s' }}>
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <h2 className="text-xl md:text-2xl font-poppins font-bold text-white hover:text-spotify-green transition-colors duration-300 cursor-pointer">Browse by Genre</h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
          {genres.map((genre, index) => (
            <div
              key={genre.name}
              className="animate-slide-in-up hover:animate-pulse"
              style={{ animationDelay: `${1.6 + index * 0.1}s` }}
            >
              <GenreCard
                genre={genre}
                onClick={() => setLocation(genre.path)}
              />
            </div>
          ))}
        </div>
      </section>

      {/* Featured Creators Section */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-poppins font-bold text-white">Featured Creators</h2>
          <a href="#" className="text-gray-400 hover:text-white text-sm font-medium">Show all</a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredCreators.map((creator: any) => (
            <CreatorCard key={creator.id} creator={creator} />
          ))}
        </div>
      </section>

      {/* Shop Section */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-poppins font-bold text-white">Creator Shop</h2>
          <a href="#" className="text-gray-400 hover:text-white text-sm font-medium">Browse all</a>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {featuredProducts.map((product: any) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Recently Played Section */}
      {recentTracks.length > 0 && (
        <TrackList tracks={recentTracks} title="Recently Played" />
      )}
    </main>
  );
}
