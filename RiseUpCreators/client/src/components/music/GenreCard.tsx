import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface GenreCardProps {
  genre: {
    name: string;
    icon: React.ComponentType<{ className?: string }>;
    gradient: string;
    path: string;
  };
  onClick: () => void;
}

export function GenreCard({ genre, onClick }: GenreCardProps) {
  const Icon = genre.icon;

  return (
    <Card
      className={cn(
        "relative overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105 group border-0 h-32",
        genre.gradient
      )}
      onClick={onClick}
    >
      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
      <div className="relative z-10 p-4 h-full flex flex-col justify-between">
        <div className="flex justify-between items-start">
          <h3 className="text-white font-bold text-lg truncate">{genre.name}</h3>
          <Icon className="w-6 h-6 text-white/80" />
        </div>
        <div className="transform translate-y-2 group-hover:translate-y-0 transition-transform">
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
            <Icon className="w-4 h-4 text-white" />
          </div>
        </div>
      </div>
    </Card>
  );
}

export default GenreCard;