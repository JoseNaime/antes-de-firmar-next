"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
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
} from "lucide-react";
import DocumentUpload from "@/components/dashboard/DocumentUpload";
import DocumentHistory from "@/components/dashboard/DocumentHistory";
import AnalysisResults from "@/components/dashboard/AnalysisResults";
import { useAuth } from "@/components/auth/AuthProvider";
import { getUserDocuments, getDocumentWithReview } from "@/lib/documents";
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

  useEffect(() => {
    console.log(loading, user);
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  // Fetch user documents
  useEffect(() => {
    const fetchDocuments = async () => {
      if (!user) return;

      setLoadingDocuments(true);
      try {
        const userDocuments = await getUserDocuments(user.id);

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
      } catch (error) {
        console.error("Error fetching documents:", error);
      } finally {
        setLoadingDocuments(false);
      }
    };

    fetchDocuments();
  }, [user]);

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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <FileText className="h-8 w-8 text-primary" />
                <h1 className="text-2xl font-bold">Legal Document AI</h1>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground">
                  Welcome, {user.name}
                </span>
                <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full">
                  <div className="h-2 w-2 rounded-full bg-primary"></div>
                  <span className="text-sm font-medium text-primary">
                    {user.tokens || 0} tokens
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Link href="/profile">
                  <Button variant="outline" size="sm">
                    <User className="h-4 w-4 mr-2" />
                    Profile
                  </Button>
                </Link>
                <Button variant="outline" size="sm" onClick={handleSignOut}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
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
                    Total Documents
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
                    Good Documents
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
                    Concerning
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
                    Problematic
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
            Upload New Document
          </Button>
          <Button
            onClick={() => setActiveView("analysis")}
            variant={activeView === "analysis" ? "default" : "outline"}
            disabled={!selectedDocumentId}
            className="flex items-center gap-2"
          >
            <BarChart3 className="h-4 w-4" />
            View Analysis
          </Button>
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Document History Sidebar */}
          <div className="lg:col-span-1">
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
          <div className="lg:col-span-3">
            {activeView === "upload" ? (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-semibold mb-2">
                    Upload a New Document
                  </h2>
                  <p className="text-muted-foreground">
                    Upload your legal document for AI-powered analysis
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
                          Select a Document
                        </h3>
                        <p className="text-muted-foreground mb-6">
                          Choose a document from your history to view its
                          analysis results
                        </p>
                        <Button
                          onClick={() => setActiveView("upload")}
                          variant="outline"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Upload New Document
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
