"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  AlertCircle,
  CheckCircle,
  AlertTriangle,
  FileText,
  Download,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import DocumentHistory from "./DocumentHistory";
import { submitFeedback, getFeedback } from "@/lib/documents";
import { useAuth } from "@/components/auth/AuthProvider";

interface AnalysisResultsProps {
  document?: {
    id: string;
    name: string;
    uploadDate: string;
    status: "completed" | "processing" | "error";
  };
  analysis?: {
    id?: string;
    summary: string;
    goodClauses: Array<{ id: string; text: string; explanation: string }>;
    concerningClauses: Array<{ id: string; text: string; explanation: string }>;
    problematicClauses: Array<{
      id: string;
      text: string;
      explanation: string;
    }>;
    legalImplications: string;
  };
}

const AnalysisResults: React.FC<AnalysisResultsProps> = ({
  document,
  analysis,
}) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("summary");
  const [currentFeedback, setCurrentFeedback] = useState<
    "thumbs_up" | "thumbs_down" | null
  >(null);
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);

  // Load existing feedback when component mounts or analysis changes
  useEffect(() => {
    const loadFeedback = async () => {
      if (!user || !analysis?.id) return;

      try {
        const feedback = await getFeedback(user.id, analysis.id);
        setCurrentFeedback(feedback?.feedback_type || null);
      } catch (error) {
        console.error("Error loading feedback:", error);
      }
    };

    loadFeedback();
  }, [user, analysis?.id]);

  const handleFeedback = async (feedbackType: "thumbs_up" | "thumbs_down") => {
    if (!user || !document || !analysis?.id) return;

    setIsSubmittingFeedback(true);
    try {
      await submitFeedback(user.id, document.id, analysis.id, feedbackType);
      setCurrentFeedback(feedbackType);
    } catch (error) {
      console.error("Error submitting feedback:", error);
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  // If no document is provided, show placeholder state
  if (!document) {
    return (
      <div className="flex flex-col items-center justify-center h-[600px] bg-background">
        <FileText className="h-16 w-16 text-muted-foreground mb-4" />
        <h3 className="text-xl font-medium mb-2">No se ha seleccionado ningún documento</h3>
        <p className="text-muted-foreground text-center max-w-md">
          Sube un documento o selecciona uno de tu historial para ver los resultados del análisis.
        </p>
      </div>
    );
  }

  // If no analysis is available, show message
  if (!analysis) {
    return (
      <div className="flex flex-col items-center justify-center h-[600px] bg-background">
        <AlertCircle className="h-16 w-16 text-muted-foreground mb-4" />
        <h3 className="text-xl font-medium mb-2">No hay análisis disponible</h3>
        <p className="text-muted-foreground text-center max-w-md">
          Este documento aún no ha sido analizado o el análisis aún está en proceso.
        </p>
      </div>
    );
  }

  // If document is processing, show loading state
  if (document.status === "processing") {
    return (
      <div className="flex flex-col items-center justify-center h-[600px] bg-background">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-300 border-t-primary"></div>
          <p className="text-lg font-medium text-muted-foreground animate-pulse">
            Analizando documento...
          </p>
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
            <div
              className="w-2 h-2 bg-primary rounded-full animate-bounce"
              style={{ animationDelay: "0.1s" }}
            ></div>
            <div
              className="w-2 h-2 bg-primary rounded-full animate-bounce"
              style={{ animationDelay: "0.2s" }}
            ></div>
          </div>
        </div>
      </div>
    );
  }

  // If document analysis had an error
  if (document.status === "error") {
    return (
      <div className="flex flex-col items-center justify-center h-[600px] bg-background">
        <AlertCircle className="h-16 w-16 text-destructive mb-4" />
        <h3 className="text-xl font-medium mb-2">Error en el análisis</h3>
        <p className="text-muted-foreground text-center max-w-md">
          Hubo un error al analizar este documento. Por favor intenta subirlo nuevamente.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-background">
      {/* Main Analysis Content */}
      <div className="w-full">
        <Card className="shadow-md">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-2xl">{document.name}</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Subido el {document.uploadDate}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {/* Feedback buttons */}
                {analysis?.id && (
                  <div className="flex items-center gap-1 mr-4">
                    <span className="text-sm text-muted-foreground mr-2">
                      Califica este análisis:
                    </span>
                    <Button
                      variant={
                        currentFeedback === "thumbs_up" ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() => handleFeedback("thumbs_up")}
                      disabled={isSubmittingFeedback}
                      className={
                        currentFeedback === "thumbs_up"
                          ? "bg-green-600 hover:bg-green-700"
                          : ""
                      }
                    >
                      <ThumbsUp className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={
                        currentFeedback === "thumbs_down"
                          ? "default"
                          : "outline"
                      }
                      size="sm"
                      onClick={() => handleFeedback("thumbs_down")}
                      disabled={isSubmittingFeedback}
                      className={
                        currentFeedback === "thumbs_down"
                          ? "bg-red-600 hover:bg-red-700"
                          : ""
                      }
                    >
                      <ThumbsDown className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                {/*}
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Descargar informe
                </Button>
                */}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid grid-cols-4 mb-6">
                <TabsTrigger value="summary">Resumen</TabsTrigger>
                <TabsTrigger value="good">
                  Bueno
                  <Badge
                    variant="outline"
                    className="ml-2 bg-green-50 text-green-700 border-green-200"
                  >
                    {analysis?.goodClauses.length || 0}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="concerning">
                  Preocupante
                  <Badge
                    variant="outline"
                    className="ml-2 bg-yellow-50 text-yellow-700 border-yellow-200"
                  >
                    {analysis?.concerningClauses.length || 0}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="problematic">
                  Problematico
                  <Badge
                    variant="outline"
                    className="ml-2 bg-red-50 text-red-700 border-red-200"
                  >
                    {analysis?.problematicClauses.length || 0}
                  </Badge>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="summary" className="space-y-4">
                <div className="p-4 rounded-lg border bg-card">
                  <h3 className="font-medium mb-2">Resumen del documento</h3>
                  <p className="text-muted-foreground">{analysis?.summary}</p>
                </div>

                <div className="p-4 rounded-lg border bg-card">
                  <h3 className="font-medium mb-2">Implicaciones legales</h3>
                  <p className="text-muted-foreground">
                    {analysis?.legalImplications}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                  <Card className="border-green-200 bg-green-50">
                    <CardContent className="pt-6">
                      <div className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                        <h3 className="font-medium">Cláusulas buenas</h3>
                      </div>
                      <p className="text-sm mt-2">
                        {analysis?.goodClauses.length} cláusulas que proporcionan términos justos
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border-yellow-200 bg-yellow-50">
                    <CardContent className="pt-6">
                      <div className="flex items-center">
                        <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
                        <h3 className="font-medium">Cláusulas preocupantes</h3>
                      </div>
                      <p className="text-sm mt-2">
                        {analysis?.concerningClauses.length} cláusulas que pueden necesitar atención
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border-red-200 bg-red-50">
                    <CardContent className="pt-6">
                      <div className="flex items-center">
                        <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                        <h3 className="font-medium">Cláusulas problemáticas</h3>
                      </div>
                      <p className="text-sm mt-2">
                        {analysis?.problematicClauses.length} cláusulas con problemas significativos
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="good">
                <ScrollArea className="h-[500px] pr-4">
                  <div className="space-y-4">
                    {analysis?.goodClauses.map((clause) => (
                      <Card key={clause.id} className="border-green-200">
                        <CardContent className="pt-6">
                          <div className="flex items-start gap-2">
                            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                            <div>
                              <p className="font-medium">"{clause.text}"</p>
                              <p className="text-sm text-muted-foreground mt-2">
                                {clause.explanation}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="concerning">
                <ScrollArea className="h-[500px] pr-4">
                  <div className="space-y-4">
                    {analysis?.concerningClauses.map((clause) => (
                      <Card key={clause.id} className="border-yellow-200">
                        <CardContent className="pt-6">
                          <div className="flex items-start gap-2">
                            <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                            <div>
                              <p className="font-medium">"{clause.text}"</p>
                              <p className="text-sm text-muted-foreground mt-2">
                                {clause.explanation}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="problematic">
                <ScrollArea className="h-[500px] pr-4">
                  <div className="space-y-4">
                    {analysis?.problematicClauses.map((clause) => (
                      <Card key={clause.id} className="border-red-200">
                        <CardContent className="pt-6">
                          <div className="flex items-start gap-2">
                            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                            <div>
                              <p className="font-medium">"{clause.text}"</p>
                              <p className="text-sm text-muted-foreground mt-2">
                                {clause.explanation}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Document History Sidebar */}
      <div className="w-full lg:w-[300px]"></div>
    </div>
  );
};

export default AnalysisResults;
