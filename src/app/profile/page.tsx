"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  User,
  Lock,
  Trash2,
  LogOut,
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff,
  ArrowLeft,
  Shield,
} from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { supabase } from "@/lib/supabase";
import { getUserDocuments } from "@/lib/documents";
import Link from "next/link";

export default function ProfilePage() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const [isDeleteDataLoading, setIsDeleteDataLoading] = useState(false);
  const [isDeleteAccountLoading, setIsDeleteAccountLoading] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [documentCount, setDocumentCount] = useState(0);
  const [isAuthProvider, setIsAuthProvider] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    const checkAuthProvider = async () => {
      if (user) {
        // Check if user signed up with OAuth provider
        const { data: authUser } = await supabase.auth.getUser();
        if (
          authUser.user?.app_metadata?.provider &&
          authUser.user.app_metadata.provider !== "email"
        ) {
          setIsAuthProvider(true);
        }

        // Get document count
        try {
          const documents = await getUserDocuments(user.id);
          setDocumentCount(documents.length);
        } catch (error) {
          console.error("Error fetching documents:", error);
        }
      }
    };

    checkAuthProvider();
  }, [user]);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPasswordLoading(true);
    setMessage(null);

    try {
      // Validate passwords
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        throw new Error("New passwords do not match");
      }

      if (passwordData.newPassword.length < 8) {
        throw new Error("New password must be at least 8 characters long");
      }

      // Update password
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword,
      });

      if (error) throw error;

      setMessage({
        type: "success",
        text: "Password updated successfully!",
      });

      // Clear form
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error: any) {
      setMessage({
        type: "error",
        text: error.message || "Failed to update password",
      });
    } finally {
      setIsPasswordLoading(false);
    }
  };

  const handleDeleteData = async () => {
    if (!user) return;

    setIsDeleteDataLoading(true);
    setMessage(null);

    try {
      // Delete all AI reviews first (due to foreign key constraint)
      const { error: reviewsError } = await supabase
        .from("ai_reviews")
        .delete()
        .in(
          "document_id",
          supabase.from("documents").select("id").eq("user_id", user.id),
        );

      if (reviewsError) throw reviewsError;

      // Delete all documents
      const { error: documentsError } = await supabase
        .from("documents")
        .delete()
        .eq("user_id", user.id);

      if (documentsError) throw documentsError;

      setDocumentCount(0);
      setMessage({
        type: "success",
        text: "All documents and analysis data deleted successfully!",
      });
    } catch (error: any) {
      setMessage({
        type: "error",
        text: error.message || "Failed to delete data",
      });
    } finally {
      setIsDeleteDataLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;

    setIsDeleteAccountLoading(true);
    setMessage(null);

    try {
      // First delete all related data
      await handleDeleteData();

      // Delete user profile
      const { error: userError } = await supabase
        .from("users")
        .delete()
        .eq("id", user.id);

      if (userError) throw userError;

      // Sign out and redirect
      await signOut();
      router.push("/");
    } catch (error: any) {
      setMessage({
        type: "error",
        text: error.message || "Failed to delete account",
      });
      setIsDeleteAccountLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-16 w-16 rounded-full bg-muted mb-4"></div>
          <div className="h-6 w-48 bg-muted rounded mb-4"></div>
          <div className="h-4 w-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <h1 className="text-2xl font-bold">Profile Settings</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {message && (
          <Alert
            variant={message.type === "error" ? "destructive" : "default"}
            className="mb-6"
          >
            {message.type === "success" ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            <AlertDescription>{message.text}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* User Info Card */}
            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Profile Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Name
                    </label>
                    <p className="text-lg">{user.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Email
                    </label>
                    <p className="text-lg">{user.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Country
                    </label>
                    <p className="text-lg">{user.country || "Not specified"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Available Tokens
                    </label>
                    <p className="text-lg font-semibold text-primary">
                      {user.tokens}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Password Change Card */}
            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Password Settings
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isAuthProvider ? (
                  <Alert>
                    <Shield className="h-4 w-4" />
                    <AlertDescription>
                      Your login is managed by your authentication provider
                      (Google). Password changes must be done through your
                      provider's account settings.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <form onSubmit={handlePasswordChange} className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Current Password
                      </label>
                      <div className="relative">
                        <Input
                          type={showPasswords.current ? "text" : "password"}
                          placeholder="Enter current password"
                          value={passwordData.currentPassword}
                          onChange={(e) =>
                            setPasswordData((prev) => ({
                              ...prev,
                              currentPassword: e.target.value,
                            }))
                          }
                          className="pr-10"
                          disabled={isPasswordLoading}
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowPasswords((prev) => ({
                              ...prev,
                              current: !prev.current,
                            }))
                          }
                          className="absolute right-3 top-2 text-muted-foreground hover:text-foreground"
                        >
                          {showPasswords.current ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        New Password
                      </label>
                      <div className="relative">
                        <Input
                          type={showPasswords.new ? "text" : "password"}
                          placeholder="Enter new password"
                          value={passwordData.newPassword}
                          onChange={(e) =>
                            setPasswordData((prev) => ({
                              ...prev,
                              newPassword: e.target.value,
                            }))
                          }
                          className="pr-10"
                          disabled={isPasswordLoading}
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowPasswords((prev) => ({
                              ...prev,
                              new: !prev.new,
                            }))
                          }
                          className="absolute right-3 top-2 text-muted-foreground hover:text-foreground"
                        >
                          {showPasswords.new ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <Input
                          type={showPasswords.confirm ? "text" : "password"}
                          placeholder="Confirm new password"
                          value={passwordData.confirmPassword}
                          onChange={(e) =>
                            setPasswordData((prev) => ({
                              ...prev,
                              confirmPassword: e.target.value,
                            }))
                          }
                          className="pr-10"
                          disabled={isPasswordLoading}
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowPasswords((prev) => ({
                              ...prev,
                              confirm: !prev.confirm,
                            }))
                          }
                          className="absolute right-3 top-2 text-muted-foreground hover:text-foreground"
                        >
                          {showPasswords.confirm ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    <Button type="submit" disabled={isPasswordLoading}>
                      {isPasswordLoading ? "Updating..." : "Update Password"}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Actions Sidebar */}
          <div className="space-y-6">
            {/* Account Stats */}
            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="text-lg">Account Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Documents Analyzed
                  </span>
                  <span className="font-semibold">{documentCount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Account Created
                  </span>
                  <span className="font-semibold">
                    {new Date(user.created_at).toLocaleDateString()}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Delete Data */}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-orange-600 border-orange-200 hover:bg-orange-50"
                      disabled={documentCount === 0}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete All Documents ({documentCount})
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete All Documents?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete all {documentCount}{" "}
                        documents and their analysis results. This action cannot
                        be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteData}
                        className="bg-orange-600 hover:bg-orange-700"
                        disabled={isDeleteDataLoading}
                      >
                        {isDeleteDataLoading
                          ? "Deleting..."
                          : "Delete All Data"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                <Separator />

                {/* Logout */}
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={handleSignOut}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>

                <Separator />

                {/* Delete Account */}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Account
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Account?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete your account and all
                        associated data, including {documentCount} documents and
                        analysis results. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteAccount}
                        className="bg-red-600 hover:bg-red-700"
                        disabled={isDeleteAccountLoading}
                      >
                        {isDeleteAccountLoading
                          ? "Deleting..."
                          : "Delete Account"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
