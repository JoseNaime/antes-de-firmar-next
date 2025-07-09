"use client";

import React, { useState } from "react";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import DocumentHistory from "./DocumentHistory";

interface AnalysisResultsProps {
  document?: {
    id: string;
    name: string;
    uploadDate: string;
    status: "completed" | "processing" | "error";
  };
  analysis?: {
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
  document = {
    id: "doc-123",
    name: "Rental Agreement.pdf",
    uploadDate: "2023-05-15",
    status: "completed",
  },
  analysis = {
    summary:
      "This rental agreement contains several standard clauses but has a few concerning elements and some problematic clauses that should be addressed before signing.",
    goodClauses: [
      {
        id: "g1",
        text: "Tenant shall pay rent on the 1st of each month",
        explanation: "Standard payment term with clear due date",
      },
      {
        id: "g2",
        text: "Landlord will maintain all structural elements of the property",
        explanation:
          "Properly assigns maintenance responsibilities to landlord",
      },
      {
        id: "g3",
        text: "Security deposit to be returned within 30 days of move-out",
        explanation:
          "Complies with standard legal timeframes for deposit returns",
      },
    ],
    concerningClauses: [
      {
        id: "c1",
        text: "Tenant responsible for all appliance repairs regardless of cause",
        explanation: "Shifts excessive maintenance burden to tenant",
      },
      {
        id: "c2",
        text: "Late fees of $50 per day for any late payment",
        explanation: "Late fee amount may be considered excessive",
      },
    ],
    problematicClauses: [
      {
        id: "p1",
        text: "Landlord may enter premises at any time without notice",
        explanation:
          "Violates tenant right to privacy and notice requirements in most jurisdictions",
      },
      {
        id: "p2",
        text: "Tenant waives all rights to security deposit return if lease terminated early for any reason",
        explanation:
          "Likely unenforceable penalty clause that contradicts security deposit laws",
      },
    ],
    legalImplications:
      "The problematic clauses in this agreement could expose you to privacy violations and potentially illegal withholding of your security deposit. The concerning clauses create financial risk through excessive repair responsibilities and punitive late fees.",
  },
}) => {
  const [activeTab, setActiveTab] = useState("summary");

  // If no document is provided, show placeholder state
  if (!document) {
    return (
      <div className="flex flex-col items-center justify-center h-[600px] bg-background">
        <FileText className="h-16 w-16 text-muted-foreground mb-4" />
        <h3 className="text-xl font-medium mb-2">No Document Selected</h3>
        <p className="text-muted-foreground text-center max-w-md">
          Upload a document or select one from your history to see analysis
          results.
        </p>
      </div>
    );
  }

  // If document is processing, show loading state
  if (document.status === "processing") {
    return (
      <div className="flex flex-col items-center justify-center h-[600px] bg-background">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-16 w-16 rounded-full bg-muted mb-4"></div>
          <div className="h-6 w-48 bg-muted rounded mb-4"></div>
          <div className="h-4 w-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  // If document analysis had an error
  if (document.status === "error") {
    return (
      <div className="flex flex-col items-center justify-center h-[600px] bg-background">
        <AlertCircle className="h-16 w-16 text-destructive mb-4" />
        <h3 className="text-xl font-medium mb-2">Analysis Error</h3>
        <p className="text-muted-foreground text-center max-w-md">
          There was an error analyzing this document. Please try uploading it
          again.
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
                  Uploaded on {document.uploadDate}
                </p>
              </div>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Download Report
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid grid-cols-4 mb-6">
                <TabsTrigger value="summary">Summary</TabsTrigger>
                <TabsTrigger value="good">
                  Good
                  <Badge
                    variant="outline"
                    className="ml-2 bg-green-50 text-green-700 border-green-200"
                  >
                    {analysis?.goodClauses.length || 0}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="concerning">
                  Concerning
                  <Badge
                    variant="outline"
                    className="ml-2 bg-yellow-50 text-yellow-700 border-yellow-200"
                  >
                    {analysis?.concerningClauses.length || 0}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="problematic">
                  Problematic
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
                  <h3 className="font-medium mb-2">Document Summary</h3>
                  <p className="text-muted-foreground">{analysis?.summary}</p>
                </div>

                <div className="p-4 rounded-lg border bg-card">
                  <h3 className="font-medium mb-2">Legal Implications</h3>
                  <p className="text-muted-foreground">
                    {analysis?.legalImplications}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                  <Card className="border-green-200 bg-green-50">
                    <CardContent className="pt-6">
                      <div className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                        <h3 className="font-medium">Good Clauses</h3>
                      </div>
                      <p className="text-sm mt-2">
                        {analysis?.goodClauses.length} clauses that provide fair
                        terms
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border-yellow-200 bg-yellow-50">
                    <CardContent className="pt-6">
                      <div className="flex items-center">
                        <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
                        <h3 className="font-medium">Concerning Clauses</h3>
                      </div>
                      <p className="text-sm mt-2">
                        {analysis?.concerningClauses.length} clauses that may
                        need attention
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border-red-200 bg-red-50">
                    <CardContent className="pt-6">
                      <div className="flex items-center">
                        <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                        <h3 className="font-medium">Problematic Clauses</h3>
                      </div>
                      <p className="text-sm mt-2">
                        {analysis?.problematicClauses.length} clauses with
                        significant issues
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
