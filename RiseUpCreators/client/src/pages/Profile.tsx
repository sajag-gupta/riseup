
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { User, Mail, MapPin, Calendar, Edit, Music, Heart, Play, TrendingUp } from "lucide-react";

const profileSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  bio: z.string().optional(),
  profilePicture: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});

type ProfileData = z.infer<typeof profileSchema>;

export default function Profile() {
  const { user, refetch } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);

  const form = useForm<ProfileData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      username: user?.username || "",
      bio: user?.bio || "",
      profilePicture: user?.profilePicture || "",
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: (data: ProfileData) => apiRequest("/api/profile", {
      method: "PUT",
      body: data,
    }),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Profile updated successfully!",
      });
      setIsEditing(false);
      refetch();
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ProfileData) => {
    updateProfileMutation.mutate(data);
  };

  if (!user) {
    return (
      <div className="flex-1 p-4 md:p-6 text-center min-h-screen bg-spotify-black">
        <p className="text-gray-400">Please log in to view your profile.</p>
      </div>
    );
  }

  return (
    <main className="flex-1 overflow-y-auto custom-scrollbar pb-24 pt-16 md:pt-0">
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-purple-900/50 via-spotify-light-gray to-spotify-black px-4 md:px-6 py-8 md:py-12">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-6 md:gap-8">
            <div className="relative group">
              <Avatar className="w-32 h-32 md:w-48 md:h-48 shadow-2xl ring-4 ring-spotify-green/20">
                <AvatarImage src={user.profilePicture || undefined} className="object-cover" />
                <AvatarFallback className="bg-gradient-to-br from-spotify-green to-purple-600 text-black text-3xl md:text-5xl font-bold">
                  {user.firstName?.[0]}{user.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
            </div>
            
            <div className="text-center md:text-left flex-1">
              <p className="text-sm text-white/70 mb-2">Profile</p>
              <h1 className="text-3xl md:text-5xl lg:text-7xl font-bold text-white mb-2 md:mb-4">
                {user.firstName} {user.lastName}
              </h1>
              <div className="flex flex-col sm:flex-row items-center gap-2 md:gap-4 text-white/80">
                <Badge variant={user.userType === 'creator' ? 'default' : 'secondary'} className="text-xs md:text-sm">
                  {user.userType === 'creator' ? 'Creator' : 'Music Lover'}
                </Badge>
                <span className="hidden sm:block">•</span>
                <span className="text-sm md:text-base">@{user.username}</span>
                <span className="hidden sm:block">•</span>
                <span className="text-sm md:text-base">Free Plan</span>
              </div>
              {user.bio && (
                <p className="text-white/80 text-sm md:text-base mt-3 md:mt-4 max-w-2xl italic">
                  "{user.bio}"
                </p>
              )}
            </div>

            <Button
              onClick={() => setIsEditing(!isEditing)}
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10 hover:border-white/40 px-6 py-2"
            >
              <Edit className="w-4 h-4 mr-2" />
              {isEditing ? 'Cancel Edit' : 'Edit Profile'}
            </Button>
          </div>
        </div>
      </div>

      <div className="px-4 md:px-6 py-6 md:py-8 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Form */}
          <div className="lg:col-span-2">
            <Card className="bg-spotify-light-gray/80 backdrop-blur border-gray-700/50 shadow-xl">
              <CardHeader>
                <CardTitle className="text-white text-xl">Profile Information</CardTitle>
                <CardDescription className="text-gray-400">
                  {isEditing ? 'Update your profile details' : 'Your personal information'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="firstName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-white">First Name</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  className="bg-spotify-dark border-gray-600 text-white focus:border-spotify-green"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="lastName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-white">Last Name</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  className="bg-spotify-dark border-gray-600 text-white focus:border-spotify-green"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={form.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">Username</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                className="bg-spotify-dark border-gray-600 text-white focus:border-spotify-green"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="profilePicture"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">Profile Picture URL</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="https://example.com/your-photo.jpg"
                                className="bg-spotify-dark border-gray-600 text-white focus:border-spotify-green"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="bio"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">Bio</FormLabel>
                            <FormControl>
                              <Textarea
                                {...field}
                                placeholder="Tell us about yourself..."
                                className="bg-spotify-dark border-gray-600 text-white resize-none focus:border-spotify-green"
                                rows={3}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="flex gap-3">
                        <Button
                          type="submit"
                          className="bg-spotify-green hover:bg-spotify-green/90 text-black font-medium"
                          disabled={updateProfileMutation.isPending}
                        >
                          {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsEditing(false)}
                          className="border-gray-600 text-gray-300 hover:text-white hover:bg-gray-700"
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </Form>
                ) : (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
                          <User className="w-4 h-4" />
                          First Name
                        </label>
                        <p className="text-white text-lg">{user.firstName}</p>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
                          <User className="w-4 h-4" />
                          Last Name
                        </label>
                        <p className="text-white text-lg">{user.lastName}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-400">Username</label>
                      <p className="text-white text-lg">@{user.username}</p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        Email
                      </label>
                      <p className="text-white text-lg">{user.email}</p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-400">Bio</label>
                      <p className="text-white">{user.bio || "No bio added yet."}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Stats Card */}
          <div className="space-y-6">
            {user.userType === 'creator' && (
              <Card className="bg-gradient-to-br from-creator-orange/20 to-spotify-green/20 backdrop-blur border-gray-700/50 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Creator Stats
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-black/20 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-spotify-green/20 rounded-full flex items-center justify-center">
                          <Play className="w-5 h-5 text-spotify-green" />
                        </div>
                        <div>
                          <p className="text-white font-medium">Monthly Listeners</p>
                          <p className="text-gray-400 text-sm">This month</p>
                        </div>
                      </div>
                      <p className="text-2xl font-bold text-spotify-green">
                        {user.monthlyListeners?.toLocaleString() || 0}
                      </p>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-black/20 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-creator-orange/20 rounded-full flex items-center justify-center">
                          <Music className="w-5 h-5 text-creator-orange" />
                        </div>
                        <div>
                          <p className="text-white font-medium">Total Earnings</p>
                          <p className="text-gray-400 text-sm">All time</p>
                        </div>
                      </div>
                      <p className="text-2xl font-bold text-creator-orange">
                        ${user.totalEarnings || "0.00"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="bg-spotify-light-gray/80 backdrop-blur border-gray-700/50 shadow-xl">
              <CardHeader>
                <CardTitle className="text-white">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 flex items-center gap-2">
                      <Heart className="w-4 h-4" />
                      Liked Songs
                    </span>
                    <span className="text-white font-medium">0</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 flex items-center gap-2">
                      <Music className="w-4 h-4" />
                      Playlists
                    </span>
                    <span className="text-white font-medium">0</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Member Since
                    </span>
                    <span className="text-white font-medium">2024</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
