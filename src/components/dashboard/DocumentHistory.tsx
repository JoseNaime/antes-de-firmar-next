"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, File, FileCheck, FileWarning } from "lucide-react";

interface Document {
  id: string;
  name: string;
  date: string;
  status: "good" | "concerning" | "problematic";
}

interface DocumentHistoryProps {
  documents?: Document[];
  onSelectDocument?: (documentId: string) => void;
}

const DocumentHistory = ({
  documents = [
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
  ],
  onSelectDocument = () => {},
}: DocumentHistoryProps) => {
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(
    null,
  );

  const handleSelectDocument = (documentId: string) => {
    setSelectedDocumentId(documentId);
    onSelectDocument(documentId);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "good":
        return <FileCheck className="h-4 w-4 text-green-500" />;
      case "concerning":
        return <FileWarning className="h-4 w-4 text-yellow-500" />;
      case "problematic":
        return <FileWarning className="h-4 w-4 text-red-500" />;
      default:
        return <File className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "good":
        return (
          <Badge
            variant="outline"
            className="bg-green-100 text-green-800 border-green-300"
          >
            Good
          </Badge>
        );
      case "concerning":
        return (
          <Badge
            variant="outline"
            className="bg-yellow-100 text-yellow-800 border-yellow-300"
          >
            Concerning
          </Badge>
        );
      case "problematic":
        return (
          <Badge
            variant="outline"
            className="bg-red-100 text-red-800 border-red-300"
          >
            Problematic
          </Badge>
        );
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <Card className="h-full bg-white border-gray-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-medium flex items-center gap-2">
          <Clock className="h-5 w-5 text-gray-500" />
          Document History
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[500px] pr-4">
          <div className="space-y-2 px-4 pb-4">
            {documents.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <File className="h-12 w-12 mx-auto mb-2 opacity-30" />
                <p>No documents in history</p>
              </div>
            ) : (
              documents.map((document) => (
                <Button
                  key={document.id}
                  variant="outline"
                  className={`w-full justify-start text-left h-auto py-3 px-4 ${selectedDocumentId === document.id ? "border-primary bg-primary/5" : "border-gray-200"}`}
                  onClick={() => handleSelectDocument(document.id)}
                >
                  <div className="flex flex-col w-full gap-1">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(document.status)}
                      <span className="font-medium truncate">
                        {document.name}
                      </span>
                    </div>
                    <div className="flex items-center justify-between w-full text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />{" "}
                        {formatDate(document.date)}
                      </span>
                      {getStatusBadge(document.status)}
                    </div>
                  </div>
                </Button>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default DocumentHistory;
