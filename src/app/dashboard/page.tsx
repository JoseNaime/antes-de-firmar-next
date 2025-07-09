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

interface Document {
  id: string;
  name: string;
  date: string;
  status: "good" | "concerning" | "problematic";
}

export default function Dashboard() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const [activeView, setActiveView] = useState<"upload" | "analysis">("upload");
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(
    null,
  );

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  const [documents, setDocuments] = useState<Document[]>([
    {
      id: "1",
      name: "Rental Agreement.pdf",
      date: "2023-05-15",
      status: "good",
    },
    {
      id: "2",
      name: "Employment Contract.pdf",
      date: "2023-04-22",
      status: "concerning",
    },
    {
      id: "3",
      name: "NDA Document.pdf",
      date: "2023-03-10",
      status: "problematic",
    },
    {
      id: "4",
      name: "Service Agreement.pdf",
      date: "2023-02-28",
      status: "good",
    },
    {
      id: "5",
      name: "Loan Terms.pdf",
      date: "2023-01-15",
      status: "concerning",
    },
  ]);

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

  const handleUploadComplete = (file: File) => {
    // Simulate adding a new document to the list
    const newDocument: Document = {
      id: Date.now().toString(),
      name: file.name,
      date: new Date().toISOString().split("T")[0],
      status: "good", // This would come from actual analysis
    };
    setDocuments((prev) => [newDocument, ...prev]);
    setActiveView("analysis");
    setSelectedDocumentId(newDocument.id);
  };

  const handleSelectDocument = (documentId: string) => {
    setSelectedDocumentId(documentId);
    setActiveView("analysis");
  };

  const getStatusCounts = () => {
    const counts = { good: 0, concerning: 0, problematic: 0 };
    documents.forEach((doc) => {
      counts[doc.status]++;
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
              <span className="text-sm text-muted-foreground">
                Welcome, {user.name}
              </span>
              <Link href="/profile">
                <Button variant="outline" size="sm">
                  <User className="h-4 w-4 mr-2" />
                  Profile
                </Button>
              </Link>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
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
                <DocumentUpload onUploadComplete={handleUploadComplete} />
              </div>
            ) : (
              <div className="space-y-6">
                {selectedDocumentId ? (
                  <AnalysisResults
                    document={{
                      id: selectedDocumentId,
                      name:
                        documents.find((d) => d.id === selectedDocumentId)
                          ?.name || "Unknown Document",
                      uploadDate:
                        documents.find((d) => d.id === selectedDocumentId)
                          ?.date || "Unknown Date",
                      status: "completed",
                    }}
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
