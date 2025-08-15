
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Upload, Music, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export default function AdminPanel() {
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    artistName: "",
    album: "",
    genre: "",
    duration: "",
  });
  const [files, setFiles] = useState({
    audio: null as File | null,
    cover: null as File | null,
    video: null as File | null,
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: adminTracks = [] } = useQuery({
    queryKey: ["/api/admin/tracks"],
    queryFn: async () => {
      const response = await fetch("/api/admin/tracks");
      if (!response.ok) throw new Error("Failed to fetch admin tracks");
      return response.json();
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async () => {
      const formDataObj = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        formDataObj.append(key, value);
      });
      
      if (files.audio) formDataObj.append("audio", files.audio);
      if (files.cover) formDataObj.append("cover", files.cover);
      if (files.video) formDataObj.append("video", files.video);

      const response = await fetch("/api/admin/tracks", {
        method: "POST",
        body: formDataObj,
      });

      if (!response.ok) {
        throw new Error("Failed to upload track");
      }

      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Track uploaded successfully!" });
      // Invalidate both admin tracks and main tracks cache for immediate sync
      queryClient.invalidateQueries({ queryKey: ["/api/admin/tracks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tracks"] });
      setFormData({ title: "", artistName: "", album: "", genre: "", duration: "" });
      setFiles({ audio: null, cover: null, video: null });
    },
    onError: () => {
      toast({ title: "Failed to upload track", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (trackId: string) => {
      const response = await fetch(`/api/admin/tracks/${trackId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete track");
    },
    onSuccess: () => {
      toast({ title: "Track deleted successfully!" });
      // Invalidate both admin tracks and main tracks cache for immediate sync
      queryClient.invalidateQueries({ queryKey: ["/api/admin/tracks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tracks"] });
    },
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: keyof typeof files) => {
    const file = e.target.files?.[0];
    if (file) {
      setFiles({ ...files, [type]: file });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!files.audio || !formData.title || !formData.artistName) {
      toast({ title: "Please fill required fields", variant: "destructive" });
      return;
    }
    uploadMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-spotify-black p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">Admin Panel</h1>

        {/* Upload Form */}
        <Card className="bg-spotify-light-gray border-gray-700 mb-8">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Upload New Track
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title" className="text-white">Title *</Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="bg-gray-700 border-gray-600 text-white"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="artistName" className="text-white">Artist Name *</Label>
                  <Input
                    id="artistName"
                    name="artistName"
                    value={formData.artistName}
                    onChange={handleInputChange}
                    className="bg-gray-700 border-gray-600 text-white"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="album" className="text-white">Album</Label>
                  <Input
                    id="album"
                    name="album"
                    value={formData.album}
                    onChange={handleInputChange}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="genre" className="text-white">Genre</Label>
                  <select
                    id="genre"
                    name="genre"
                    value={formData.genre}
                    onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                    className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:border-spotify-green focus:outline-none"
                    required
                  >
                    <option value="">Select Genre</option>
                    <option value="Rock">Rock</option>
                    <option value="Pop">Pop</option>
                    <option value="Hip Hop">Hip Hop</option>
                    <option value="Electronic">Electronic</option>
                    <option value="Jazz">Jazz</option>
                    <option value="Classical">Classical</option>
                    <option value="Folk">Folk</option>
                    <option value="Country">Country</option>
                    <option value="R&B">R&B</option>
                    <option value="Reggae">Reggae</option>
                    <option value="Blues">Blues</option>
                    <option value="Instrumental">Instrumental</option>
                    <option value="Ambient">Ambient</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                <div>
                  <Label htmlFor="video" className="text-white">Music Video (Optional)</Label>
                  <input
                    id="video"
                    type="file"
                    accept="video/*"
                    onChange={(e) => handleFileChange(e, "video")}
                    className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={uploadMutation.isPending}
                className="bg-spotify-green text-black hover:bg-spotify-light-green"
              >
                <Upload className="w-4 h-4 mr-2" />
                {uploadMutation.isPending ? "Uploading..." : "Upload Track"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Tracks List */}
        <Card className="bg-spotify-light-gray border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Music className="w-5 h-5" />
              Admin Tracks Library
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left p-4 text-gray-400 font-medium">Title</th>
                    <th className="text-left p-4 text-gray-400 font-medium">Artist</th>
                    <th className="text-left p-4 text-gray-400 font-medium">Album</th>
                    <th className="text-left p-4 text-gray-400 font-medium">Plays</th>
                    <th className="text-right p-4 text-gray-400 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {adminTracks.length > 0 ? (
                    adminTracks.map((track: any) => (
                      <tr key={track._id} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                        <td className="p-4 text-white">{track.title}</td>
                        <td className="p-4 text-gray-300">{track.artistName}</td>
                        <td className="p-4 text-gray-300">{track.album || "—"}</td>
                        <td className="p-4 text-gray-300">{track.plays.toLocaleString()}</td>
                        <td className="p-4 text-right">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteMutation.mutate(track._id)}
                            className="text-gray-400 hover:text-red-400 hover:bg-gray-600 p-2"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-gray-400">
                        No tracks uploaded yet. Upload your first track!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
