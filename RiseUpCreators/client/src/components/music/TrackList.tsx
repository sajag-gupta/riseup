import { Play, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePlayer } from "@/hooks/use-player";

interface Track {
  id: string;
  title: string;
  creator: { username: string };
  album?: string;
  coverUrl?: string;
  duration?: number;
  audioUrl: string;
}

interface TrackListProps {
  tracks: Track[];
  title: string;
}

export function TrackList({ tracks, title }: TrackListProps) {
  const { playTrack } = usePlayer();

  const formatTime = (seconds?: number) => {
    if (!seconds) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-poppins font-bold text-white">{title}</h2>
      </div>

      <div className="space-y-2">
        {tracks.map((track, index) => (
          <div
            key={track.id ? `track-${track.id}` : `track-${index}-${track.title}`}
            className="flex items-center px-4 py-3 hover:bg-spotify-light-gray rounded-lg transition-colors cursor-pointer group"
          >
            <div className="w-12 h-12 flex-shrink-0 mr-4">
              <img
                src={track.coverUrl || "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=80"}
                alt={`Album cover for ${track.title}`}
                className="w-full h-full object-cover rounded"
              />
            </div>
            <div className="flex-grow min-w-0">
              <h4 className="text-white font-medium truncate">{track.title}</h4>
              <p className="text-gray-400 text-sm truncate">
                {track.creator.username}
                {track.album && ` • ${track.album}`}
              </p>
            </div>
            <div className="flex items-center space-x-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                <Heart className="w-5 h-5" />
              </Button>
              <span className="text-gray-400 text-sm">{formatTime(track.duration)}</span>
              <Button
                onClick={() => playTrack(track)}
                className="w-8 h-8 bg-spotify-green rounded-full flex items-center justify-center hover:scale-110 transition-transform"
              >
                <Play className="w-4 h-4 text-black ml-0.5" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}