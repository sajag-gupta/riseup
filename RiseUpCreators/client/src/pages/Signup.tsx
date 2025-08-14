
import { useEffect } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { useToast } from "../hooks/use-toast";
import { useAuth } from "../hooks/use-auth";
import { Link } from "wouter";

const signupSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  userType: z.enum(["fan", "creator"]),
});

type SignupData = z.infer<typeof signupSchema>;

export default function Signup() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { register, isAuthenticated, refetch } = useAuth();

  const form = useForm<SignupData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: "",
      username: "",
      password: "",
      firstName: "",
      lastName: "",
      userType: "fan",
    },
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      setLocation("/");
    }
  }, [isAuthenticated, setLocation]);

  const signupMutation = useMutation({
    mutationFn: async (data: SignupData) => {
      await register(data);
    },
    onSuccess: () => {
      toast({
        title: "Welcome to Rise Up Creators!",
        description: "Your account has been created successfully.",
      });
      refetch();
      setLocation("/");
    },
    onError: (error: Error) => {
      toast({
        title: "Signup failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: SignupData) => {
    signupMutation.mutate(data);
  };

  const heroStyle = {
    backgroundImage: `url("https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80")`,
    backgroundSize: "cover",
    backgroundPosition: "center",
  };

  return (
    <div className="min-h-screen flex bg-black">
      {/* Left Side - Auth Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 lg:p-16 bg-gradient-to-br from-gray-900 via-black to-gray-800">
        {/* Header */}
        <div className="w-full max-w-md mb-8">
          <div className="text-center mb-8">
            <Link href="/">
              <h1 className="text-3xl font-bold cursor-pointer">
                <span className="text-emerald-400">Rise Up</span>{" "}
                <span className="text-white">Creators</span>
              </h1>
            </Link>
            <p className="text-gray-400 mt-2">Join the music revolution</p>
          </div>

          {/* Tab Navigation */}
          <div className="flex bg-gray-800 rounded-lg p-1 mb-8">
            <Link href="/login" className="flex-1">
              <button className="w-full py-2 px-4 rounded-md text-sm font-medium transition-colors text-gray-400 hover:text-white">
                Login
              </button>
            </Link>
            <button className="flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors bg-emerald-500 text-white">
              Sign Up
            </button>
          </div>
        </div>

        {/* Signup Form - with scrollable container */}
        <div className="w-full max-w-md max-h-[70vh] overflow-y-auto">
          <div className="bg-gray-900/50 backdrop-blur border border-gray-700 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-white mb-2">Create account</h2>
            <p className="text-gray-400 mb-6">Join Rise Up Creators today</p>

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-white text-sm font-medium mb-2">First Name</label>
                  <Input
                    {...form.register("firstName")}
                    placeholder="First name"
                    className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-emerald-500 focus:ring-emerald-500"
                  />
                  {form.formState.errors.firstName && (
                    <p className="text-red-400 text-sm mt-1">{form.formState.errors.firstName.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-white text-sm font-medium mb-2">Last Name</label>
                  <Input
                    {...form.register("lastName")}
                    placeholder="Last name"
                    className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-emerald-500 focus:ring-emerald-500"
                  />
                  {form.formState.errors.lastName && (
                    <p className="text-red-400 text-sm mt-1">{form.formState.errors.lastName.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-white text-sm font-medium mb-2">Username</label>
                <Input
                  {...form.register("username")}
                  placeholder="Enter your username"
                  className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-emerald-500 focus:ring-emerald-500"
                />
                {form.formState.errors.username && (
                  <p className="text-red-400 text-sm mt-1">{form.formState.errors.username.message}</p>
                )}
              </div>

              <div>
                <label className="block text-white text-sm font-medium mb-2">Email</label>
                <Input
                  {...form.register("email")}
                  type="email"
                  placeholder="Enter your email"
                  className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-emerald-500 focus:ring-emerald-500"
                />
                {form.formState.errors.email && (
                  <p className="text-red-400 text-sm mt-1">{form.formState.errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="block text-white text-sm font-medium mb-2">Password</label>
                <Input
                  {...form.register("password")}
                  type="password"
                  placeholder="Enter your password"
                  className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-emerald-500 focus:ring-emerald-500"
                />
                {form.formState.errors.password && (
                  <p className="text-red-400 text-sm mt-1">{form.formState.errors.password.message}</p>
                )}
              </div>

              <div>
                <label className="block text-white text-sm font-medium mb-2">Account Type</label>
                <select
                  {...form.register("userType")}
                  className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-emerald-500 focus:ring-emerald-500"
                >
                  <option value="fan">Music Fan</option>
                  <option value="creator">Music Creator</option>
                </select>
                {form.formState.errors.userType && (
                  <p className="text-red-400 text-sm mt-1">{form.formState.errors.userType.message}</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={signupMutation.isPending}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-lg font-semibold transition-colors"
              >
                {signupMutation.isPending ? "Creating account..." : "Create account"}
              </Button>
            </form>

            <div className="text-center text-sm text-gray-400 mt-6">
              Already have an account?{" "}
              <Link href="/login">
                <span className="text-emerald-400 hover:underline cursor-pointer">Sign in</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Hero Section */}
      <div className="hidden lg:flex lg:w-1/2 relative" style={heroStyle}>
        <div className="absolute inset-0 bg-gradient-to-l from-black/60 via-black/40 to-transparent" />
        <div className="relative flex flex-col justify-center items-center text-center p-16 text-white">
          <div className="max-w-lg">
            <h2 className="text-5xl font-bold mb-4">
              Set the stage.
            </h2>
            <p className="text-xl text-gray-200">
              Publish your sound and reach your audience.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
