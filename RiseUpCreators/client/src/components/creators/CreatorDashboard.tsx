
import { useState } from "react";
import { X, Upload, Play, DollarSign, Users, Music, Plus, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface CreatorDashboardProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Track {
  id: string;
  title: string;
  artist: string;
  duration: string;
  plays: number;
  earnings: string;
}

export function CreatorDashboard({ isOpen, onClose }: CreatorDashboardProps) {
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploadData, setUploadData] = useState({
    title: "",
    genre: "",
    description: "",
    audioFile: null as File | null,
    coverImage: null as File | null,
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: analytics } = useQuery({
    queryKey: ["/api/creators/demo-creator/analytics"],
    enabled: isOpen,
  });

  const { data: tracks = [] } = useQuery<Track[]>({
    queryKey: ["/api/creators/tracks"],
    enabled: isOpen,
  });

  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch("/api/tracks/upload", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) throw new Error("Upload failed");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Track uploaded successfully!",
        description: "Your track is now available on the platform.",
      });
      setShowUploadForm(false);
      setUploadData({
        title: "",
        genre: "",
        description: "",
        audioFile: null,
        coverImage: null,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/creators/tracks"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (trackId: string) => {
      const response = await fetch(`/api/tracks/${trackId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Delete failed");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Track deleted",
        description: "Your track has been removed.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/creators/tracks"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Delete failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!uploadData.title || !uploadData.audioFile) {
      toast({
        title: "Missing required fields",
        description: "Please provide a title and audio file.",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData();
    formData.append("title", uploadData.title);
    formData.append("genre", uploadData.genre);
    formData.append("description", uploadData.description);
    formData.append("audio", uploadData.audioFile);
    if (uploadData.coverImage) {
      formData.append("cover", uploadData.coverImage);
    }

    uploadMutation.mutate(formData);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: "audio" | "cover") => {
    const file = e.target.files?.[0];
    if (file) {
      if (type === "audio") {
        setUploadData(prev => ({ ...prev, audioFile: file }));
      } else {
        setUploadData(prev => ({ ...prev, coverImage: file }));
      }
    }
  };

  const handleClose = () => {
    setShowUploadForm(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
      <div className="bg-spotify-gray rounded-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto custom-scrollbar">
        <div className="p-6 border-b border-gray-700 flex items-center justify-between sticky top-0 bg-spotify-gray z-10">
          <h2 className="text-2xl font-poppins font-bold text-white">Creator Dashboard</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="text-gray-400 hover:text-white hover:bg-gray-700 p-2 rounded-lg"
          >
            <X className="w-6 h-6" />
          </Button>
        </div>
        
        <div className="p-6">
          {/* Analytics Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-spotify-light-gray p-6 rounded-lg border border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-gray-400 text-sm">Total Plays</h3>
                <Play className="w-5 h-5 text-spotify-green" />
              </div>
              <p className="text-2xl font-bold text-white">{analytics?.totalPlays || "2.3M"}</p>
              <p className="text-spotify-green text-sm">+15% this month</p>
            </div>
            
            <div className="bg-spotify-light-gray p-6 rounded-lg border border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-gray-400 text-sm">Monthly Listeners</h3>
                <Users className="w-5 h-5 text-blue-400" />
              </div>
              <p className="text-2xl font-bold text-white">{analytics?.monthlyListeners || "485K"}</p>
              <p className="text-blue-400 text-sm">+8% this month</p>
            </div>
            
            <div className="bg-spotify-light-gray p-6 rounded-lg border border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-gray-400 text-sm">Total Earnings</h3>
                <DollarSign className="w-5 h-5 text-creator-orange" />
              </div>
              <p className="text-2xl font-bold text-white">${analytics?.totalEarnings || "12,450"}</p>
              <p className="text-creator-orange text-sm">+23% this month</p>
            </div>
            
            <div className="bg-spotify-light-gray p-6 rounded-lg border border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-gray-400 text-sm">Total Tracks</h3>
                <Music className="w-5 h-5 text-purple-400" />
              </div>
              <p className="text-2xl font-bold text-white">{tracks.length || 0}</p>
              <p className="text-purple-400 text-sm">Active tracks</p>
            </div>
          </div>

          {/* Upload Track Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">My Tracks</h3>
              <Button
                onClick={() => setShowUploadForm(!showUploadForm)}
                className="bg-spotify-green hover:bg-spotify-light-green text-black px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Upload Track
              </Button>
            </div>

            {showUploadForm && (
              <div className="bg-spotify-light-gray p-6 rounded-lg border border-gray-700 mb-6">
                <h4 className="text-lg font-semibold text-white mb-4">Upload New Track</h4>
                <form onSubmit={handleUpload} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="title" className="text-white">Track Title *</Label>
                      <Input
                        id="title"
                        value={uploadData.title}
                        onChange={(e) => setUploadData(prev => ({ ...prev, title: e.target.value }))}
                        className="bg-gray-700 border-gray-600 text-white"
                        placeholder="Enter track title"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="genre" className="text-white">Genre</Label>
                      <select
                        id="genre"
                        value={uploadData.genre}
                        onChange={(e) => setUploadData(prev => ({ ...prev, genre: e.target.value }))}
                        className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white"
                      >
                        <option value="">Select genre</option>
                        <option value="rock">Rock</option>
                        <option value="pop">Pop</option>
                        <option value="hip-hop">Hip Hop</option>
                        <option value="electronic">Electronic</option>
                        <option value="jazz">Jazz</option>
                        <option value="folk">Folk</option>
                        <option value="classical">Classical</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description" className="text-white">Description</Label>
                    <Textarea
                      id="description"
                      value={uploadData.description}
                      onChange={(e) => setUploadData(prev => ({ ...prev, description: e.target.value }))}
                      className="bg-gray-700 border-gray-600 text-white"
                      placeholder="Describe your track..."
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="audio" className="text-white">Audio File *</Label>
                      <input
                        id="audio"
                        type="file"
                        accept="audio/*"
                        onChange={(e) => handleFileChange(e, "audio")}
                        className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-spotify-green file:text-black"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="cover" className="text-white">Cover Image</Label>
                      <input
                        id="cover"
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, "cover")}
                        className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-creator-orange file:text-white"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      type="submit"
                      disabled={uploadMutation.isPending}
                      className="bg-spotify-green hover:bg-spotify-light-green text-black px-6 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2"
                    >
                      <Upload className="w-4 h-4" />
                      {uploadMutation.isPending ? "Uploading..." : "Upload Track"}
                    </Button>
                    <Button
                      type="button"
                      onClick={() => setShowUploadForm(false)}
                      variant="outline"
                      className="border-gray-600 text-gray-300 hover:bg-gray-700"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </div>
            )}
          </div>

          {/* Tracks List */}
          <div className="bg-spotify-light-gray rounded-lg border border-gray-700 overflow-hidden">
            <div className="p-4 border-b border-gray-700">
              <h4 className="text-lg font-semibold text-white">Track Library</h4>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left p-4 text-gray-400 font-medium">Title</th>
                    <th className="text-left p-4 text-gray-400 font-medium">Duration</th>
                    <th className="text-left p-4 text-gray-400 font-medium">Plays</th>
                    <th className="text-left p-4 text-gray-400 font-medium">Earnings</th>
                    <th className="text-right p-4 text-gray-400 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tracks.length > 0 ? (
                    tracks.map((track) => (
                      <tr key={track.id} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                        <td className="p-4 text-white">{track.title}</td>
                        <td className="p-4 text-gray-300">{track.duration}</td>
                        <td className="p-4 text-gray-300">{track.plays.toLocaleString()}</td>
                        <td className="p-4 text-creator-orange">${track.earnings}</td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-gray-400 hover:text-white hover:bg-gray-600 p-2"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => deleteMutation.mutate(track.id)}
                              className="text-gray-400 hover:text-red-400 hover:bg-gray-600 p-2"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-gray-400">
                        No tracks uploaded yet. Click "Upload Track" to get started!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
