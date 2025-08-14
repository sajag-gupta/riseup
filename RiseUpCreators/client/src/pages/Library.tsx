import { Plus, Music, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TrackList } from "@/components/music/TrackList";
import { useQuery } from "@tanstack/react-query";

export default function Library() {
  const { data: playlists = [] } = useQuery({
    queryKey: ["/api/playlists"],
  });

  const { data: likedTracks = [] } = useQuery({
    queryKey: ["/api/tracks/liked"],
  });

  return (
    <main className="flex-1 overflow-y-auto custom-scrollbar px-6 pb-24">
      <div className="mb-8">
        <h1 className="text-4xl font-poppins font-bold text-white mb-6">Your Library</h1>
        
        <div className="flex space-x-4 mb-8">
          <Button className="bg-spotify-green text-black px-6 py-3 rounded-full font-semibold hover:bg-spotify-light-green transition-colors flex items-center space-x-2">
            <Plus className="w-5 h-5" />
            <span>Create Playlist</span>
          </Button>
        </div>
      </div>

      {/* Quick Access */}
      <section className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gradient-to-r from-purple-500 to-blue-500 p-6 rounded-lg cursor-pointer hover:scale-105 transition-transform">
            <div className="flex items-center">
              <Heart className="w-12 h-12 text-white mr-4" />
              <div>
                <h3 className="text-white font-bold text-lg">Liked Songs</h3>
                <p className="text-white/80">Your favorite tracks</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-6 rounded-lg cursor-pointer hover:scale-105 transition-transform">
            <div className="flex items-center">
              <Music className="w-12 h-12 text-white mr-4" />
              <div>
                <h3 className="text-white font-bold text-lg">Recently Played</h3>
                <p className="text-white/80">Your listening history</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Playlists */}
      <section className="mb-8">
        <h2 className="text-2xl font-poppins font-bold text-white mb-6">Your Playlists</h2>
        
        {playlists.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {playlists.map((playlist: any) => (
              <div key={playlist.id} className="bg-spotify-light-gray p-4 rounded-lg hover:bg-gray-700 transition-colors cursor-pointer">
                <div className="w-full aspect-square bg-gradient-to-br from-spotify-green to-creator-orange rounded-lg mb-4 flex items-center justify-center">
                  <Music className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-semibold text-white mb-1 truncate">{playlist.name}</h3>
                <p className="text-gray-400 text-sm">{playlist.trackIds?.length || 0} songs</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Music className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">No playlists yet</p>
            <p className="text-gray-500 mt-2">Create your first playlist to get started</p>
          </div>
        )}
      </section>

      {/* Recently Liked */}
      {likedTracks.length > 0 && (
        <TrackList tracks={likedTracks} title="Recently Liked" />
      )}
    </main>
  );
}
