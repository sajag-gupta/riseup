
import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { useToast } from "../hooks/use-toast";
import { useAuth } from "../hooks/use-auth";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

const emailOnlySchema = z.object({
  email: z.string().email("Please enter a valid email"),
});

const otpOnlySchema = z.object({
  email: z.string().email(),
  otp: z.string().min(6, "OTP must be 6 digits"),
});

const resetSchema = z
  .object({
    email: z.string().email(),
    otp: z.string().min(6, "OTP must be 6 digits"),
    newPassword: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Password must be at least 6 characters"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type LoginData = z.infer<typeof loginSchema>;
type EmailOnly = z.infer<typeof emailOnlySchema>;
type OtpOnly = z.infer<typeof otpOnlySchema>;
type ResetData = z.infer<typeof resetSchema>;
type ForgotStep = "email" | "otp" | "reset";

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { login, isAuthenticated, refetch } = useAuth();

  const [showForgot, setShowForgot] = useState(false);
  const [step, setStep] = useState<ForgotStep>("email");
  const [forgotEmail, setForgotEmail] = useState("");
  const [verifiedOtp, setVerifiedOtp] = useState("");
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");

  const form = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const emailForm = useForm<EmailOnly>({
    resolver: zodResolver(emailOnlySchema),
    defaultValues: { email: "" },
  });

  const otpForm = useForm<OtpOnly>({
    resolver: zodResolver(otpOnlySchema),
    defaultValues: { email: "", otp: "" },
  });

  const resetForm = useForm<ResetData>({
    resolver: zodResolver(resetSchema),
    defaultValues: { email: "", otp: "", newPassword: "", confirmPassword: "" },
  });

  useEffect(() => {
    if (isAuthenticated) {
      setLocation("/");
    }
  }, [isAuthenticated, setLocation]);

  const loginMutation = useMutation({
    mutationFn: async (data: LoginData) => {
      await login(data.email, data.password);
    },
    onSuccess: () => {
      toast({ title: "Welcome back!", description: "You have successfully logged in." });
      refetch();
      setLocation("/");
    },
    onError: (error: Error) => {
      toast({ title: "Login failed", description: error.message, variant: "destructive" });
    },
  });

  const sendOtpMutation = useMutation({
    mutationFn: async (email: string) => {
      const response = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!response.ok) throw new Error("Failed to send OTP");
      return response.json();
    },
    onSuccess: () => {
      setStep("otp");
      toast({ title: "OTP sent", description: "Check your email for the verification code." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to send OTP. Please try again.", variant: "destructive" });
    },
  });

  const verifyOtpMutation = useMutation({
    mutationFn: async (data: OtpOnly) => {
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Invalid OTP");
      return response.json();
    },
    onSuccess: (_, variables) => {
      setVerifiedOtp(variables.otp);
      resetForm.setValue("email", forgotEmail);
      resetForm.setValue("otp", variables.otp);
      setStep("reset");
      toast({ title: "OTP verified", description: "You can now reset your password." });
    },
    onError: () => {
      toast({ title: "Invalid OTP", description: "Please check your code and try again.", variant: "destructive" });
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async (data: ResetData) => {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to reset password");
      return response.json();
    },
    onSuccess: () => {
      setShowForgot(false);
      setStep("email");
      toast({ title: "Password reset successful", description: "You can now log in with your new password." });
    },
    onError: () => {
      toast({ title: "Reset failed", description: "Failed to reset password. Please try again.", variant: "destructive" });
    },
  });

  const onLogin = (data: LoginData) => loginMutation.mutate(data);

  const onSendOtp = () => {
    const email = emailForm.getValues("email");
    if (!email) {
      emailForm.setError("email", { type: "manual", message: "Email is required" });
      return;
    }
    setForgotEmail(email);
    otpForm.setValue("email", email);
    sendOtpMutation.mutate(email);
  };

  const onVerifyOtp = (data: OtpOnly) => verifyOtpMutation.mutate({ ...data, email: forgotEmail });

  const onResetPassword = (data: ResetData) => {
    resetPasswordMutation.mutate({ ...data, email: forgotEmail, otp: verifiedOtp });
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
            <button
              onClick={() => setActiveTab("login")}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === "login"
                  ? "bg-emerald-500 text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setActiveTab("signup")}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === "signup"
                  ? "bg-emerald-500 text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Sign Up
            </button>
          </div>
        </div>

        {/* Auth Content */}
        <div className="w-full max-w-md">
          {activeTab === "login" ? (
            <div className="bg-gray-900/50 backdrop-blur border border-gray-700 rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-white mb-2">Welcome back</h2>
              <p className="text-gray-400 mb-6">Sign in to your account</p>

              {!showForgot ? (
                <form onSubmit={form.handleSubmit(onLogin)} className="space-y-4">
                  <div>
                    <label className="block text-white text-sm font-medium mb-2">Username</label>
                    <Input
                      {...form.register("email")}
                      type="email"
                      placeholder="Enter your username"
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

                  <Button
                    type="submit"
                    disabled={loginMutation.isPending}
                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-lg font-semibold transition-colors"
                  >
                    {loginMutation.isPending ? "Signing in..." : "Sign In"}
                  </Button>
                </form>
              ) : (
                <div className="space-y-4">
                  {step === "email" && (
                    <form onSubmit={emailForm.handleSubmit(onSendOtp)} className="space-y-4">
                      <div>
                        <label className="block text-white text-sm font-medium mb-2">Email</label>
                        <Input
                          {...emailForm.register("email")}
                          type="email"
                          placeholder="Enter your email"
                          className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-emerald-500 focus:ring-emerald-500"
                        />
                        {emailForm.formState.errors.email && (
                          <p className="text-red-400 text-sm mt-1">{emailForm.formState.errors.email.message}</p>
                        )}
                      </div>
                      <Button
                        type="submit"
                        disabled={sendOtpMutation.isPending}
                        className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-lg font-semibold transition-colors"
                      >
                        {sendOtpMutation.isPending ? "Sending..." : "Send OTP"}
                      </Button>
                    </form>
                  )}

                  {step === "otp" && (
                    <form onSubmit={otpForm.handleSubmit(onVerifyOtp)} className="space-y-4">
                      <div>
                        <label className="block text-white text-sm font-medium mb-2">Enter OTP</label>
                        <div
                          className="flex gap-2 justify-center"
                          onPaste={(e) => {
                            const paste = e.clipboardData.getData("text").trim();
                            if (/^\d{6}$/.test(paste)) {
                              otpForm.setValue("otp", paste);
                              setTimeout(() => otpForm.handleSubmit(onVerifyOtp)(), 0);
                            }
                          }}
                        >
                          {[0, 1, 2, 3, 4, 5].map((i) => (
                            <input
                              key={i}
                              type="text"
                              inputMode="numeric"
                              maxLength={1}
                              className="w-12 h-12 text-center text-xl rounded-md bg-gray-800 border border-gray-600 text-white focus:border-emerald-500 focus:ring focus:ring-emerald-500/30 outline-none"
                              value={otpForm.watch("otp")?.[i] || ""}
                              onChange={(e) => {
                                const val = e.target.value.replace(/[^0-9]/g, "");
                                let newOtp = otpForm.watch("otp") ? otpForm.watch("otp").split("") : Array(6).fill("");
                                newOtp[i] = val;
                                const joined = newOtp.join("");
                                otpForm.setValue("otp", joined);
                                if (val && i < 5) document.getElementById(`otp-${i + 1}`)?.focus();
                                if (joined.length === 6) {
                                  setTimeout(() => otpForm.handleSubmit(onVerifyOtp)(), 0);
                                }
                              }}
                              id={`otp-${i}`}
                              onKeyDown={(e) => {
                                if (e.key === "Backspace" && !otpForm.watch("otp")?.[i] && i > 0) {
                                  document.getElementById(`otp-${i - 1}`)?.focus();
                                }
                              }}
                            />
                          ))}
                        </div>
                        {otpForm.formState.errors.otp && (
                          <p className="text-red-400 text-sm mt-1">{otpForm.formState.errors.otp.message}</p>
                        )}
                      </div>
                      <Button
                        type="submit"
                        disabled={verifyOtpMutation.isPending}
                        className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-lg font-semibold transition-colors"
                      >
                        {verifyOtpMutation.isPending ? "Verifying..." : "Verify OTP"}
                      </Button>
                    </form>
                  )}

                  {step === "reset" && (
                    <form onSubmit={resetForm.handleSubmit(onResetPassword)} className="space-y-4">
                      <input type="hidden" {...resetForm.register("email")} value={forgotEmail} />
                      <input type="hidden" {...resetForm.register("otp")} value={verifiedOtp} />

                      <div>
                        <label className="block text-white text-sm font-medium mb-2">New Password</label>
                        <Input
                          {...resetForm.register("newPassword")}
                          type="password"
                          placeholder="Enter new password"
                          className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-emerald-500 focus:ring-emerald-500"
                        />
                        {resetForm.formState.errors.newPassword && (
                          <p className="text-red-400 text-sm mt-1">{resetForm.formState.errors.newPassword.message}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-white text-sm font-medium mb-2">Confirm Password</label>
                        <Input
                          {...resetForm.register("confirmPassword")}
                          type="password"
                          placeholder="Confirm new password"
                          className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-emerald-500 focus:ring-emerald-500"
                        />
                        {resetForm.formState.errors.confirmPassword && (
                          <p className="text-red-400 text-sm mt-1">{resetForm.formState.errors.confirmPassword.message}</p>
                        )}
                      </div>

                      <Button
                        type="submit"
                        disabled={resetPasswordMutation.isPending}
                        className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-lg font-semibold transition-colors"
                      >
                        {resetPasswordMutation.isPending ? "Changing..." : "Change Password"}
                      </Button>
                    </form>
                  )}
                </div>
              )}

              <div className="mt-6 text-center">
                {!showForgot ? (
                  <button
                    type="button"
                    onClick={() => setShowForgot(true)}
                    className="text-emerald-400 hover:underline text-sm"
                  >
                    Forgot your password?
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowForgot(false)}
                    className="text-emerald-400 hover:underline text-sm"
                  >
                    Back to Sign in
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-gray-400">
                Click on Sign Up tab or{" "}
                <Link href="/signup" className="text-emerald-400 hover:underline">
                  go to signup page
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Right Side - Hero Section */}
      <div className="hidden lg:flex lg:w-1/2 relative" style={heroStyle}>
        <div className="absolute inset-0 bg-gradient-to-l from-black/60 via-black/40 to-transparent" />
        <div className="relative flex flex-col justify-center items-center text-center p-16 text-white">
          <div className="max-w-lg">
            <h2 className="text-5xl font-bold mb-4">
              Your Music.
              <br />
              Your Audience.
              <br />
              <span className="text-emerald-400">Your Success.</span>
            </h2>
            <p className="text-xl text-gray-200">
              Join thousands of creators building their music careers on Rise Up Creators
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
