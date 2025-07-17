"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Link from "next/link";
import {
  FileText,
  Upload,
  BarChart3,
  Clock,
  Plus,
  User,
  Settings,
  LogOut,
  Crown,
  Zap,
  HelpCircle,
  Send,
} from "lucide-react";
import DocumentUpload from "@/components/dashboard/DocumentUpload";
import DocumentHistory from "@/components/dashboard/DocumentHistory";
import AnalysisResults from "@/components/dashboard/AnalysisResults";
import SubscriptionPlans from "@/components/subscription/SubscriptionPlans";
import { useAuth } from "@/components/auth/AuthProvider";
import { getUserDocuments, getDocumentWithReview } from "@/lib/documents";
import { getUserSubscription } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import type { Database } from "@/lib/supabase";

type DocumentWithReview = Database["public"]["Tables"]["documents"]["Row"] & {
  ai_reviews: Database["public"]["Tables"]["ai_reviews"]["Row"][];
};

interface Document {
  id: string;
  name: string;
  date: string;
  status: "good" | "concerning" | "problematic" | "analyzing";
}

interface UserSubscription {
  subscription_tier: "freemium" | "basic" | "advanced";
  is_active: boolean;
  subscription_benefits?: {
    monthly_tokens: number;
    upload_limit: number | null;
    human_review_access: boolean;
    support_prioritization: string;
    token_purchase_discount: number;
  };
}

export default function Dashboard() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const [activeView, setActiveView] = useState<"upload" | "analysis">("upload");
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(
    null,
  );
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocument, setSelectedDocument] =
    useState<DocumentWithReview | null>(null);
  const [loadingDocuments, setLoadingDocuments] = useState(false);
  const [userSubscription, setUserSubscription] =
    useState<UserSubscription | null>(null);
  const [subscriptionDialogOpen, setSubscriptionDialogOpen] = useState(false);
  const [helpDialogOpen, setHelpDialogOpen] = useState(false);
  const [supportForm, setSupportForm] = useState({
    subject: "",
    message: "",
    priority: "medium",
  });
  const [isSubmittingSupport, setIsSubmittingSupport] = useState(false);

  useEffect(() => {
    console.log("Dashboard useEffect - loading:", loading, "user:", user?.name);
    if (!loading && !user) {
      console.log("Redirecting to login - no user and not loading");
      router.replace("/login");
    }
  }, [user, loading, router]);

  // Fetch user documents and subscription
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      console.log("Fetching user documents and subscription for user:", user.id);
      setLoadingDocuments(true);
      try {
        const [userDocuments, subscription] = await Promise.all([
          getUserDocuments(user.id),
          getUserSubscription(user.id),
        ]);

        // Transform documents to match the expected format
        const transformedDocuments: Document[] = userDocuments.map((doc) => {
          const review = doc.ai_reviews?.[0];
          // Show as "analyzing" if document is processing and has no review yet
          let status: "good" | "concerning" | "problematic" | "analyzing" =
            "good";
          if (doc.status === "processing" && !review) {
            status = "analyzing";
          } else if (review?.overall_status) {
            status = review.overall_status;
          }
          return {
            id: doc.id,
            name: doc.name,
            date: new Date(doc.created_at).toISOString().split("T")[0],
            status,
          };
        });

        setDocuments(transformedDocuments);
        setUserSubscription(subscription);
        console.log("Documents and subscription loaded successfully");
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoadingDocuments(false);
      }
    };

    fetchData();
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  console.log("Dashboard render - loading:", loading, "user:", user?.name, "loadingDocuments:", loadingDocuments);

  if (loading) {
    console.log("Showing loading screen");
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
    console.log("No user found, returning null");
    return null;
  }

  console.log("Rendering dashboard with user:", user.name);

  const refreshDocuments = async () => {
    if (!user) return;

    try {
      const userDocuments = await getUserDocuments(user.id);
      const transformedDocuments: Document[] = userDocuments.map((doc) => {
        const review = doc.ai_reviews?.[0];
        // Show as "analyzing" if document is processing and has no review yet
        let status: "good" | "concerning" | "problematic" | "analyzing" =
          "good";
        if (doc.status === "processing" && !review) {
          status = "analyzing";
        } else if (review?.overall_status) {
          status = review.overall_status;
        }
        return {
          id: doc.id,
          name: doc.name,
          date: new Date(doc.created_at).toISOString().split("T")[0],
          status,
        };
      });
      setDocuments(transformedDocuments);
    } catch (error) {
      console.error("Error refreshing documents:", error);
    }
  };

  const refreshSubscription = async () => {
    if (!user) return;

    try {
      const subscription = await getUserSubscription(user.id);
      setUserSubscription(subscription);
    } catch (error) {
      console.error("Error refreshing subscription:", error);
    }
  };

  const handleUploadComplete = async (documentId: string) => {
    // Refresh documents list to show the new document as "analyzing"
    await refreshDocuments();
  };

  const handleAnalysisComplete = async () => {
    // Refresh documents list to show the updated analysis status
    await refreshDocuments();
  };

  const handleSelectDocument = async (documentId: string) => {
    if (!user) return;

    setSelectedDocumentId(documentId);
    setActiveView("analysis");

    try {
      const documentWithReview = await getDocumentWithReview(
        documentId,
        user.id,
      );
      setSelectedDocument(documentWithReview);
    } catch (error) {
      console.error("Error fetching document with review:", error);
    }
  };

  const getStatusCounts = () => {
    const counts = { good: 0, concerning: 0, problematic: 0, analyzing: 0 };
    documents.forEach((doc) => {
      if (doc.status === "analyzing") {
        counts.analyzing++;
      } else {
        counts[doc.status as "good" | "concerning" | "problematic"]++;
      }
    });
    return counts;
  };

  const statusCounts = getStatusCounts();

  const getSubscriptionIcon = (tier: string) => {
    switch (tier) {
      case "freemium":
        return <Zap className="h-4 w-4" />;
      case "basic":
        return <User className="h-4 w-4" />;
      case "advanced":
        return <Crown className="h-4 w-4" />;
      default:
        return <Zap className="h-4 w-4" />;
    }
  };

  const getSubscriptionColor = (tier: string) => {
    switch (tier) {
      case "freemium":
        return "text-gray-600 bg-gray-100";
      case "basic":
        return "text-blue-600 bg-blue-100";
      case "advanced":
        return "text-purple-600 bg-purple-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const handleSupportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingSupport(true);

    try {
      if (!user) {
        throw new Error("User not authenticated");
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
          "Ya tienes una solicitud de soporte activa pendiente. La revisaremos prontamente y te responderemos por correo electrónico. Si ha ocurrido un nuevo problema, cuando nos comuniquemos contigo, podrás agregar la información adicional sobre el nuevo problema.",
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <FileText className="h-8 w-8 text-primary" />
                <h1 className="text-2xl font-bold">Antes de Firmar</h1>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground">
                  Bienvenido, {user.name}
                </span>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full">
                    <div className="h-2 w-2 rounded-full bg-primary"></div>
                    <span className="text-sm font-medium text-primary">
                      {user.tokens || 0} tokens
                    </span>
                  </div>
                  <Dialog
                    open={subscriptionDialogOpen}
                    onOpenChange={setSubscriptionDialogOpen}
                  >
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className={`flex items-center gap-2 px-3 py-1 rounded-full border-2 hover:scale-105 transition-transform cursor-pointer ${
                          userSubscription
                            ? getSubscriptionColor(
                                userSubscription.subscription_tier,
                              )
                            : "text-gray-600 bg-gray-100"
                        }`}
                      >
                        {userSubscription ? (
                          getSubscriptionIcon(
                            userSubscription.subscription_tier,
                          )
                        ) : (
                          <Zap className="h-4 w-4" />
                        )}
                        <span className="text-sm font-medium capitalize">
                          {userSubscription?.subscription_tier === "freemium" ? "Gratuito" :
                           userSubscription?.subscription_tier === "basic" ? "Básico" :
                           userSubscription?.subscription_tier === "advanced" ? "Avanzado" :
                           "Gratuito"}
                        </span>
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Gestiona tu Suscripción</DialogTitle>
                      </DialogHeader>
                      <SubscriptionPlans
                        userId={user.id}
                        onSubscriptionChange={async () => {
                          await refreshSubscription();
                          setSubscriptionDialogOpen(false);
                        }}
                      />
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
              <div className="flex items-center gap-2">
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
                <Link href="/profile">
                  <Button variant="outline" size="sm">
                    <User className="h-4 w-4 mr-2" />
                    Perfil
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Total de Documentos
                  </p>
                  <p className="text-3xl font-bold">{documents.length}</p>
                </div>
                <FileText className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-green-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">
                    Documentos Buenos
                  </p>
                  <p className="text-3xl font-bold text-green-600">
                    {statusCounts.good}
                  </p>
                </div>
                <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                  <div className="h-4 w-4 rounded-full bg-green-500"></div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-yellow-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-yellow-600">
                    Preocupantes
                  </p>
                  <p className="text-3xl font-bold text-yellow-600">
                    {statusCounts.concerning}
                  </p>
                </div>
                <div className="h-8 w-8 rounded-full bg-yellow-100 flex items-center justify-center">
                  <div className="h-4 w-4 rounded-full bg-yellow-500"></div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-red-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-600">
                    Problemáticos
                  </p>
                  <p className="text-3xl font-bold text-red-600">
                    {statusCounts.problematic}
                  </p>
                </div>
                <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
                  <div className="h-4 w-4 rounded-full bg-red-500"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <Button
            onClick={() => setActiveView("upload")}
            className="flex items-center gap-2"
            variant={activeView === "upload" ? "default" : "outline"}
          >
            <Plus className="h-4 w-4" />
            Subir Documento
          </Button>
          <Button
            onClick={() => setActiveView("analysis")}
            variant={activeView === "analysis" ? "default" : "outline"}
            disabled={!selectedDocumentId}
            className="flex items-center gap-2"
          >
            <BarChart3 className="h-4 w-4" />
            Ver Análisis
          </Button>
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-7 gap-8">
          {/* Document History Sidebar */}
          <div className="lg:col-span-2">
            <DocumentHistory
              documents={documents}
              onSelectDocument={handleSelectDocument}
              onDocumentDeleted={async () => {
                // Refresh documents list after deletion
                await refreshDocuments();

                // Clear selected document if it was deleted
                if (
                  selectedDocumentId &&
                  !documents.find((doc) => doc.id === selectedDocumentId)
                ) {
                  setSelectedDocumentId(null);
                  setSelectedDocument(null);
                }
              }}
              userId={user?.id}
            />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-5">
            {activeView === "upload" ? (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-semibold mb-2">
                    Subir un Nuevo Documento
                  </h2>
                  <p className="text-muted-foreground">
                    Sube tu documento para análizarlo
                  </p>
                </div>
                <DocumentUpload
                  onUploadComplete={handleUploadComplete}
                  onAnalysisComplete={handleAnalysisComplete}
                />
              </div>
            ) : (
              <div className="space-y-6">
                {selectedDocumentId && selectedDocument ? (
                  <AnalysisResults
                    document={{
                      id: selectedDocument.id,
                      name: selectedDocument.name,
                      uploadDate: new Date(
                        selectedDocument.created_at,
                      ).toLocaleDateString(),
                      status:
                        selectedDocument.status === "completed"
                          ? "completed"
                          : selectedDocument.status === "processing"
                            ? "processing"
                            : "error",
                    }}
                    analysis={
                      selectedDocument.ai_reviews?.[0]
                        ? {
                            id: selectedDocument.ai_reviews[0].id,
                            summary:
                              selectedDocument.ai_reviews[0].summary || "",
                            goodClauses:
                              selectedDocument.ai_reviews[0].good_clauses || [],
                            concerningClauses:
                              selectedDocument.ai_reviews[0]
                                .concerning_clauses || [],
                            problematicClauses:
                              selectedDocument.ai_reviews[0]
                                .problematic_clauses || [],
                            legalImplications:
                              selectedDocument.ai_reviews[0]
                                .legal_implications || "",
                          }
                        : undefined
                    }
                  />
                ) : (
                  <Card className="bg-white">
                    <CardContent className="pt-12 pb-12">
                      <div className="text-center">
                        <BarChart3 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-xl font-medium mb-2">
                          Selecciona un Documento
                        </h3>
                        <p className="text-muted-foreground mb-6">
                          Elige un documento de tu historial para ver sus
                          resultados de análisis
                        </p>
                        <Button
                          onClick={() => setActiveView("upload")}
                          variant="outline"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Subir Documento
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
