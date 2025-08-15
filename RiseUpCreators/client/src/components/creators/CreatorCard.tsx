import { Play } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Creator {
  id: string;
  username: string;
  profilePicture?: string;
  bio?: string;
  monthlyListeners: number;
  totalEarnings: string;
}

interface CreatorCardProps {
  creator: Creator;
}

export function CreatorCard({ creator }: CreatorCardProps) {
  const formatListeners = (listeners: number) => {
    if (listeners >= 1000000) {
      return `${(listeners / 1000000).toFixed(1)}M`;
    }
    if (listeners >= 1000) {
      return `${(listeners / 1000).toFixed(0)}K`;
    }
    return listeners.toString();
  };

  return (
    <div className="bg-gradient-to-br from-spotify-light-gray to-gray-800 p-6 rounded-xl hover:scale-105 transition-all cursor-pointer border border-gray-700 hover:border-spotify-green">
      <div className="flex items-center mb-4">
        <img
          src={creator.profilePicture || "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=100"}
          alt={`Profile picture of ${creator.username}`}
          className="w-16 h-16 rounded-full object-cover border-2 border-spotify-green"
        />
        <div className="ml-4">
          <h3 className="font-bold text-lg text-white">{creator.username}</h3>
          <p className="text-gray-400">Creator</p>
          <p className="text-spotify-green text-sm font-medium">
            {formatListeners(creator.monthlyListeners)} monthly listeners
          </p>
        </div>
      </div>
      <p className="text-gray-300 text-sm mb-4">
        {creator.bio || "Creating amazing music for everyone to enjoy."}
      </p>
      <div className="flex items-center justify-between">
        <div className="flex space-x-3">
          <Button className="bg-spotify-green hover:bg-spotify-light-green text-black px-4 py-2 rounded-full font-semibold transition-colors">
            Follow
          </Button>
          <Button
            variant="secondary"
            className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-full font-semibold transition-colors"
          >
            <Play className="w-4 h-4" />
          </Button>
        </div>
        <div className="text-right">
          <p className="text-creator-orange font-semibold">${creator.totalEarnings}</p>
          <p className="text-gray-400 text-xs">Total Earnings</p>
        </div>
      </div>
    </div>
  );
}
