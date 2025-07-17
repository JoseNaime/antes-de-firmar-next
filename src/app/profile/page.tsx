"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
  CreditCard,
  Crown,
  Zap,
  Calendar,
  HelpCircle,
  Send,
} from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { supabase } from "@/lib/supabase";
import { getUserDocuments, deleteAllUserDocuments } from "@/lib/documents";
import { getUserSubscription } from "@/lib/auth";
import SubscriptionPlans from "@/components/subscription/SubscriptionPlans";
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
  const [activeTab, setActiveTab] = useState<"profile" | "subscription">(
    "profile",
  );
  const [subscriptionData, setSubscriptionData] = useState<any>(null);
  const [subscriptionLoading, setSubscriptionLoading] = useState(true);
  const [helpDialogOpen, setHelpDialogOpen] = useState(false);
  const [supportForm, setSupportForm] = useState({
    subject: "",
    message: "",
    priority: "medium",
  });
  const [isSubmittingSupport, setIsSubmittingSupport] = useState(false);

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
        console.log("Auth user:", authUser);
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

        // Get subscription data
        try {
          setSubscriptionLoading(true);
          const subscription = await getUserSubscription(user.id);
          setSubscriptionData(subscription);
        } catch (error) {
          console.error("Error fetching subscription:", error);
        } finally {
          setSubscriptionLoading(false);
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
        throw new Error("Las contraseñas no coinciden");
      }

      if (passwordData.newPassword.length < 8) {
        throw new Error("La nueva contraseña debe tener al menos 8 caracteres");
      }

      // Update password
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword,
      });

      if (error) throw error;

      setMessage({
        type: "success",
        text: "¡Contraseña actualizada exitosamente!",
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
        text: error.message || "Error al actualizar la contraseña",
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
      await deleteAllUserDocuments(user.id);

      setDocumentCount(0);
      setMessage({
        type: "success",
        text: "¡Todos los documentos y datos de análisis fueron eliminados exitosamente!",
      });
    } catch (error: any) {
      setMessage({
        type: "error",
        text: error.message || "Error al eliminar los datos, puedes ir a la sección de documentos y eliminar los documentos uno por uno",
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
      await deleteAllUserDocuments(user.id);

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
        text: error.message || "Error al eliminar la cuenta, contacta a soporte para eliminar tu cuenta",
      });
      setIsDeleteAccountLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  const handleSupportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingSupport(true);

    try {
      if (!user) {
        throw new Error("Usuario no autenticado");
      }

      // Check if user already has a pending support ticket
      const { data: existingTickets, error: checkError } = await supabase
        .from("support_tickets")
        .select("id")
        .eq("user_id", user.id)
        .eq("status", "pending")
        .limit(1);

      if (checkError) {
        throw checkError;
      }

      if (existingTickets && existingTickets.length > 0) {
        // User already has a pending ticket
        alert(
          "Ya tienes una solicitud de soporte activa pendiente. La revisaremos y te responderemos por correo electrónico. Si ha ocurrido un nuevo problema, cuando nos comuniquemos contigo, podrás agregar la información adicional sobre el nuevo problema.",
        );
        setHelpDialogOpen(false);
        return;
      }

      // Save support ticket to database
      const { error } = await supabase.from("support_tickets").insert({
        user_id: user.id,
        subject: supportForm.subject,
        message: supportForm.message,
        priority: supportForm.priority,
        status: "pending",
      });

      if (error) {
        throw error;
      }

      // Reset form and close dialog
      setSupportForm({ subject: "", message: "", priority: "medium" });
      setHelpDialogOpen(false);

      // Show success message
      alert(
        "¡Gracias por contactarnos! Hemos recibido tu solicitud de soporte y nos comunicaremos contigo por correo electrónico sobre tu consulta. Nuestro equipo típicamente responde dentro de 24-48horas.",
      );
    } catch (error: any) {
      console.error("Error submitting support request:", error);
      alert("Error al enviar la solicitud de soporte. Por favor, inténtalo de nuevo.");
    } finally {
      setIsSubmittingSupport(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 border-b-2 border-primary mb-4"></div>
          <p className="text-lg font-medium text-muted-foreground">Obteniendo información...</p>
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
                  Dashboard
                </Button>
              </Link>
              <div className="flex items-center gap-4">
                <h1 className="text-2xl font-bold">Configuración del Perfil</h1>
                <div className="flex gap-2">
                  <Button
                    variant={activeTab === "profile" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setActiveTab("profile")}
                  >
                    <User className="h-4 w-4 mr-2" />
                    Perfil
                  </Button>
                  <Button
                    variant={
                      activeTab === "subscription" ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() => setActiveTab("subscription")}
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    Suscripción
                  </Button>
                </div>
              </div>
              <Dialog open={helpDialogOpen} onOpenChange={setHelpDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <HelpCircle className="h-4 w-4 mr-2" />
                    Ayuda
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Contactar Soporte</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSupportSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="subject">Asunto</Label>
                      <Input
                        id="subject"
                        placeholder="Breve descripción de tu problema"
                        value={supportForm.subject}
                        onChange={(e) =>
                          setSupportForm((prev) => ({
                            ...prev,
                            subject: e.target.value,
                          }))
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="priority">Prioridad</Label>
                      <select
                        id="priority"
                        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        value={supportForm.priority}
                        onChange={(e) =>
                          setSupportForm((prev) => ({
                            ...prev,
                            priority: e.target.value,
                          }))
                        }
                      >
                        <option value="low">Baja</option>
                        <option value="medium">Media</option>
                        <option value="high">Alta</option>
                        <option value="urgent">Urgente</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="message">Mensaje</Label>
                      <Textarea
                        id="message"
                        placeholder="Por favor describe tu problema o pregunta en detalle..."
                        value={supportForm.message}
                        onChange={(e) =>
                          setSupportForm((prev) => ({
                            ...prev,
                            message: e.target.value,
                          }))
                        }
                        rows={4}
                        required
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setHelpDialogOpen(false)}
                      >
                        Cancelar
                      </Button>
                      <Button type="submit" disabled={isSubmittingSupport}>
                        <Send className="h-4 w-4 mr-2" />
                        {isSubmittingSupport ? "Enviando..." : "Enviar Solicitud"}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
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

        {activeTab === "profile" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Information */}
            <div className="lg:col-span-2 space-y-6">
              {/* User Info Card */}
              <Card className="bg-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Información del Perfil
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Nombre
                      </label>
                      <p className="text-lg">{user.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Correo Electrónico
                      </label>
                      <p className="text-lg">{user.email}</p>
                    </div>
                    {/*
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        País
                      </label>
                      <p className="text-lg">
                        {user.country || "No especificado"}
                      </p>
                    </div>
                    */}
                    
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Tokens Disponibles
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
                    Configuración de Contraseña
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isAuthProvider ? (
                    <Alert>
                      <Shield className="h-4 w-4" />
                      <AlertDescription>
                        Tu inicio de sesión es administrado por tu proveedor de autenticación
                        (Google). Los cambios de contraseña deben realizarse a través de la
                        configuración de cuenta de tu proveedor.
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <form onSubmit={handlePasswordChange} className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          Contraseña Actual
                        </label>
                        <div className="relative">
                          <Input
                            type={showPasswords.current ? "text" : "password"}
                            placeholder="Ingresa tu contraseña actual"
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
                          Nueva Contraseña
                        </label>
                        <div className="relative">
                          <Input
                            type={showPasswords.new ? "text" : "password"}
                            placeholder="Ingresa tu nueva contraseña"
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
                          Confirmar Nueva Contraseña
                        </label>
                        <div className="relative">
                          <Input
                            type={showPasswords.confirm ? "text" : "password"}
                            placeholder="Confirma tu nueva contraseña"
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
                        {isPasswordLoading ? "Actualizando..." : "Actualizar Contraseña"}
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Actions Sidebar */}
            <div className="space-y-6">
              {/* Subscription Info */}
              <Card className="bg-white">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Suscripción
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {subscriptionLoading ? (
                    <div className="flex flex-col items-center justify-center py-4">
                      <div className="animate-spin rounded-full h-8 border-b-2 border-primary mb-2"></div>
                      <p className="text-sm text-muted-foreground">Obteniendo información...</p>
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">
                          Plan
                        </span>
                        <div className="flex items-center gap-2">
                          {subscriptionData?.subscription_tier ===
                            "freemium" && (
                            <Zap className="h-4 w-4 text-gray-600" />
                          )}
                          {subscriptionData?.subscription_tier === "basic" && (
                            <User className="h-4 w-4 text-blue-600" />
                          )}
                          {subscriptionData?.subscription_tier ===
                            "advanced" && (
                            <Crown className="h-4 w-4 text-purple-600" />
                          )}
                          <span className="font-semibold capitalize">
                           {subscriptionData?.subscription_tier === "freemium" ? "Gratuito" :
                             subscriptionData?.subscription_tier === "basic" ? "Básico" :
                             subscriptionData?.subscription_tier === "advanced" ? "Avanzado" : "Gratuito"
                             }</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">
                          Tokens Mensuales
                        </span>
                        <span className="font-semibold">
                          {subscriptionData?.subscription_benefits
                            ?.monthly_tokens || 50}
                        </span>
                      </div>
                      {subscriptionData?.next_token_reward_at && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">
                            Próximo Cargo
                          </span>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="font-semibold">
                              {new Date(
                                subscriptionData.next_token_reward_at,
                              ).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      )}
                      {subscriptionData?.subscription_tier === "freemium" && (
                        <div className="pt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={() => setActiveTab("subscription")}
                          >
                            Mejorar Plan
                          </Button>
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Account Stats */}
              <Card className="bg-white">
                <CardHeader>
                  <CardTitle className="text-lg">Resumen de Cuenta</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Documentos Analizados
                    </span>
                    <span className="font-semibold">{documentCount}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Cuenta Creada
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
                  <CardTitle className="text-lg">Acciones Rápidas</CardTitle>
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
                        Eliminar Todos los Documentos ({documentCount})
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          ¿Eliminar Todos los Documentos?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          Esto eliminará permanentemente todos los {documentCount}{" "}
                          documentos y sus resultados de análisis. Esta acción
                          no se puede deshacer y no se puede recuperar los tokens ni datos.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDeleteData}
                          className="bg-orange-600 hover:bg-orange-700"
                          disabled={isDeleteDataLoading}
                        >
                          {isDeleteDataLoading
                            ? "Eliminando..."
                            : "Eliminar Todos los Datos"}
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
                    Cerrar Sesión
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
                        Eliminar Cuenta
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>¿Eliminar Cuenta?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Esto eliminará permanentemente tu cuenta y todos los
                          datos asociados, incluyendo {documentCount} documentos
                          y resultados de análisis. Esta acción no se puede deshacer.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDeleteAccount}
                          className="bg-red-600 hover:bg-red-700"
                          disabled={isDeleteAccountLoading}
                        >
                          {isDeleteAccountLoading
                            ? "Eliminando..."
                            : "Eliminar Cuenta"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeTab === "subscription" && (
          <div className="max-w-6xl mx-auto">
            <SubscriptionPlans
              userId={user.id}
              onSubscriptionChange={() => {
                // Refresh user data when subscription changes
                window.location.reload();
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
