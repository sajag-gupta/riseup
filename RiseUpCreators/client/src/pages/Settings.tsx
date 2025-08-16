
// src/pages/Settings.tsx
import { useState, useMemo } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Shield, Bell, Eye, Trash2, LogOut } from "lucide-react";
import { useLocation } from "wouter";

/** ---------------------------
 * Endpoints (tweak to match your backend)
 * -------------------------- */
const ENDPOINTS = {
  changePassword: "/api/auth/change-password", // PUT { currentPassword, newPassword }
  sendPasswordOtp: "/api/auth/send-password-otp", // POST { email }
  resetWithOtp: "/api/auth/reset-password-otp", // POST { email, otp, newPassword }
  logout: "/api/auth/logout", // POST
  deleteAccount: "/api/auth/delete-account", // DELETE
};

/** ---------------------------
 * Utilities
 * -------------------------- */
async function jsonFetch<T = unknown>(
  url: string,
  init?: RequestInit & { json?: unknown }
): Promise<T> {
  const { json, headers, ...rest } = init ?? {};
  const res = await fetch(url, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(headers || {}),
    },
    ...(json !== undefined ? { body: JSON.stringify(json) } : {}),
    ...rest,
  });

  const text = await res.text();
  const data = text ? (JSON.parse(text) as unknown) : undefined;

  if (!res.ok) {
    const msg =
      (data as any)?.message ||
      (data as any)?.error ||
      `Request failed (${res.status})`;
    throw new Error(msg);
  }
  return (data as T) ?? (undefined as T);
}

/** ---------------------------
 * Validation
 * -------------------------- */
const passwordChangeSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(6, "New password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type PasswordChangeData = z.infer<typeof passwordChangeSchema>;

const otpResetSchema = z
  .object({
    email: z.string().email("Invalid email"),
    otp: z.string().min(4, "Enter the OTP sent to your email"),
    newPassword: z.string().min(6, "New password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type OtpResetData = z.infer<typeof otpResetSchema>;

export default function Settings() {
  const { user, refetch } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    marketing: false,
  });

  const [privacy, setPrivacy] = useState({
    profileVisible: true,
    showListenHistory: false,
    allowFollowing: true,
  });

  // Mode: "password" | "otp"
  const [mode, setMode] = useState<"password" | "otp">("otp");

  const passwordForm = useForm<PasswordChangeData>({
    resolver: zodResolver(passwordChangeSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const otpForm = useForm<OtpResetData>({
    resolver: zodResolver(otpResetSchema),
    defaultValues: {
      email: user?.email || "",
      otp: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  /** Change password (old password flow) */
  const changePasswordMutation = useMutation({
    mutationFn: (data: PasswordChangeData) =>
      jsonFetch<{ success: boolean; message?: string }>(ENDPOINTS.changePassword, {
        method: "PUT",
        json: data,
      }),
    onSuccess: (res) => {
      toast({
        title: "Success",
        description: res?.message || "Password changed successfully!",
      });
      passwordForm.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to change password",
        variant: "destructive",
      });
    },
  });

  /** OTP: send */
  const sendOtpMutation = useMutation({
    mutationFn: (email: string) =>
      jsonFetch<{ success: boolean; message?: string }>(ENDPOINTS.sendPasswordOtp, {
        method: "POST",
        json: { email },
      }),
    onSuccess: (res) => {
      toast({
        title: "OTP sent",
        description: res?.message || "Check your email for the OTP.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send OTP",
        variant: "destructive",
      });
    },
  });

  /** OTP: reset */
  const resetWithOtpMutation = useMutation({
    mutationFn: (data: OtpResetData) =>
      jsonFetch<{ success: boolean; message?: string }>(ENDPOINTS.resetWithOtp, {
        method: "POST",
        json: {
          email: data.email,
          otp: data.otp,
          newPassword: data.newPassword,
        },
      }),
    onSuccess: (res) => {
      toast({
        title: "Success",
        description: res?.message || "Password reset successfully!",
      });
      otpForm.reset({
        email: user?.email || "",
        otp: "",
        newPassword: "",
        confirmPassword: "",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to reset password",
        variant: "destructive",
      });
    },
  });

  /** Logout */
  const logoutMutation = useMutation({
    mutationFn: () =>
      jsonFetch<{ success: boolean; message?: string }>(ENDPOINTS.logout, {
        method: "POST",
      }),
    onSuccess: (res) => {
      toast({
        title: "Success",
        description: res?.message || "Logged out successfully",
      });
      refetch();
      setLocation("/login");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Logout failed",
        variant: "destructive",
      });
    },
  });

  /** Delete account */
  const deleteAccountMutation = useMutation({
    mutationFn: () =>
      jsonFetch<{ success: boolean; message?: string }>(ENDPOINTS.deleteAccount, {
        method: "DELETE",
      }),
    onSuccess: (res) => {
      toast({
        title: "Account Deleted",
        description: res?.message || "Your account has been permanently deleted",
      });
      refetch();
      setLocation("/");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Account deletion failed",
        variant: "destructive",
      });
    },
  });

  const onPasswordSubmit = (data: PasswordChangeData) => {
    changePasswordMutation.mutate(data);
  };

  const onOtpSend = () => {
    const email = otpForm.getValues("email") || user?.email || "";
    if (!email) {
      otpForm.setError("email", { type: "manual", message: "Email is required" });
      return;
    }
    sendOtpMutation.mutate(email);
  };

  const onOtpReset = (data: OtpResetData) => {
    resetWithOtpMutation.mutate(data);
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const handleDeleteAccount = () => {
    if (
      confirm(
        "Are you sure you want to delete your account? This action cannot be undone."
      )
    ) {
      deleteAccountMutation.mutate();
    }
  };

  if (!user) {
    return (
      <main className="flex-1 overflow-y-auto custom-scrollbar px-6 pb-24">
        <div className="text-center py-12">
          <p className="text-gray-400">Please log in to access settings.</p>
        </div>
      </main>
    );
  }

  const isSending = sendOtpMutation.isPending;
  const isResetting = resetWithOtpMutation.isPending;
  const isChanging = changePasswordMutation.isPending;

  return (
    <main className="flex-1 overflow-y-auto custom-scrollbar px-6 pb-24">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
          <p className="text-gray-400">Manage your account preferences and security</p>
        </div>

        <div className="space-y-6">
          {/* Security Settings */}
          <Card className="bg-spotify-light-gray border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center text-white">
                <Shield className="w-5 h-5 mr-2" />
                Security
              </CardTitle>
              <CardDescription className="text-gray-400">
                Change your password via OTP (recommended) or using your current password
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Mode Switch */}
              <div className="inline-flex rounded-lg overflow-hidden border border-gray-700">
                <button
                  type="button"
                  onClick={() => setMode("otp")}
                  className={`px-4 py-2 text-sm transition-colors ${
                    mode === "otp"
                      ? "bg-emerald-500 text-white"
                      : "bg-transparent text-gray-300 hover:bg-gray-800"
                  }`}
                >
                  Use OTP
                </button>
                <button
                  type="button"
                  onClick={() => setMode("password")}
                  className={`px-4 py-2 text-sm transition-colors ${
                    mode === "password"
                      ? "bg-emerald-500 text-white"
                      : "bg-transparent text-gray-300 hover:bg-gray-800"
                  }`}
                >
                  Use current password
                </button>
              </div>

              {mode === "otp" ? (
                <Form {...otpForm}>
                  <form
                    onSubmit={otpForm.handleSubmit(onOtpReset)}
                    className="space-y-4"
                  >
                    <FormField
                      control={otpForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Email</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="email"
                              placeholder="you@example.com"
                              className="bg-spotify-dark border-gray-600 text-white focus:border-spotify-green"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex flex-col sm:flex-row items-start sm:items-end gap-3">
                      <FormField
                        control={otpForm.control}
                        name="otp"
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormLabel className="text-white">OTP</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="text"
                                placeholder="Enter OTP"
                                className="bg-spotify-dark border-gray-600 text-white focus:border-spotify-green"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button
                        type="button"
                        onClick={onOtpSend}
                        className="bg-spotify-green hover:bg-spotify-green/90 text-black whitespace-nowrap"
                        disabled={isSending}
                      >
                        {isSending ? "Sending..." : "Send OTP"}
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={otpForm.control}
                        name="newPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">New Password</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="password"
                                className="bg-spotify-dark border-gray-600 text-white focus:border-spotify-green"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={otpForm.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">Confirm New Password</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="password"
                                className="bg-spotify-dark border-gray-600 text-white focus:border-spotify-green"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <Button
                      type="submit"
                      className="bg-spotify-green hover:bg-spotify-green/90 text-black"
                      disabled={isResetting}
                    >
                      {isResetting ? "Resetting..." : "Reset Password"}
                    </Button>
                  </form>
                </Form>
              ) : (
                <Form {...passwordForm}>
                  <form
                    onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
                    className="space-y-4"
                  >
                    <FormField
                      control={passwordForm.control}
                      name="currentPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Current Password</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="password"
                              className="bg-spotify-dark border-gray-600 text-white focus:border-spotify-green"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={passwordForm.control}
                        name="newPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">New Password</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="password"
                                className="bg-spotify-dark border-gray-600 text-white focus:border-spotify-green"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={passwordForm.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">Confirm New Password</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="password"
                                className="bg-spotify-dark border-gray-600 text-white focus:border-spotify-green"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <Button
                      type="submit"
                      className="bg-spotify-green hover:bg-spotify-green/90 text-black"
                      disabled={isChanging}
                    >
                      {isChanging ? "Changing..." : "Change Password"}
                    </Button>
                  </form>
                </Form>
              )}
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card className="bg-spotify-light-gray border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center text-white">
                <Bell className="w-5 h-5 mr-2" />
                Notifications
              </CardTitle>
              <CardDescription className="text-gray-400">
                Choose what notifications you'd like to receive
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between py-2">
                <div className="pr-4">
                  <p className="text-white font-medium">Email Notifications</p>
                  <p className="text-sm text-gray-400">Receive notifications via email</p>
                </div>
                <Switch
                  checked={notifications.email}
                  onCheckedChange={(checked: boolean) =>
                    setNotifications((prev) => ({ ...prev, email: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between py-2">
                <div className="pr-4">
                  <p className="text-white font-medium">Push Notifications</p>
                  <p className="text-sm text-gray-400">
                    Receive push notifications in your browser
                  </p>
                </div>
                <Switch
                  checked={notifications.push}
                  onCheckedChange={(checked: boolean) =>
                    setNotifications((prev) => ({ ...prev, push: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between py-2">
                <div className="pr-4">
                  <p className="text-white font-medium">Marketing Emails</p>
                  <p className="text-sm text-gray-400">
                    Receive promotional content and updates
                  </p>
                </div>
                <Switch
                  checked={notifications.marketing}
                  onCheckedChange={(checked: boolean) =>
                    setNotifications((prev) => ({ ...prev, marketing: checked }))
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Privacy Settings */}
          <Card className="bg-spotify-light-gray border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center text-white">
                <Eye className="w-5 h-5 mr-2" />
                Privacy
              </CardTitle>
              <CardDescription className="text-gray-400">
                Control your privacy and visibility settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between py-2">
                <div className="pr-4">
                  <p className="text-white font-medium">Public Profile</p>
                  <p className="text-sm text-gray-400">Make your profile visible to other users</p>
                </div>
                <Switch
                  checked={privacy.profileVisible}
                  onCheckedChange={(checked: boolean) =>
                    setPrivacy((prev) => ({ ...prev, profileVisible: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between py-2">
                <div className="pr-4">
                  <p className="text-white font-medium">Show Listen History</p>
                  <p className="text-sm text-gray-400">Let others see what you're listening to</p>
                </div>
                <Switch
                  checked={privacy.showListenHistory}
                  onCheckedChange={(checked: boolean) =>
                    setPrivacy((prev) => ({ ...prev, showListenHistory: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between py-2">
                <div className="pr-4">
                  <p className="text-white font-medium">Allow Following</p>
                  <p className="text-sm text-gray-400">Let other users follow your activity</p>
                </div>
                <Switch
                  checked={privacy.allowFollowing}
                  onCheckedChange={(checked: boolean) =>
                    setPrivacy((prev) => ({ ...prev, allowFollowing: checked }))
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Account Actions */}
          <Card className="bg-spotify-light-gray border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Account Actions</CardTitle>
              <CardDescription className="text-gray-400">
                Manage your account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  className="border-gray-600 text-gray-300 hover:text-white hover:border-gray-500 hover:bg-gray-700"
                  disabled={logoutMutation.isPending}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  {logoutMutation.isPending ? "Logging out..." : "Log Out"}
                </Button>

                <Button
                  onClick={handleDeleteAccount}
                  variant="destructive"
                  className="bg-red-600 hover:bg-red-700"
                  disabled={deleteAccountMutation.isPending}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  {deleteAccountMutation.isPending ? "Deleting..." : "Delete Account"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
