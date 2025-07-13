"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Clock,
  File,
  FileCheck,
  FileWarning,
  List,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import { deleteDocument } from "@/lib/documents";

interface Document {
  id: string;
  name: string;
  date: string;
  status: "good" | "concerning" | "problematic";
}

interface DocumentHistoryProps {
  documents?: Document[];
  onSelectDocument?: (documentId: string) => void;
  onDocumentDeleted?: () => void;
  userId?: string;
}

const DocumentHistory = ({
  documents = [],
  onSelectDocument = () => {},
  onDocumentDeleted = () => {},
  userId = "",
}: DocumentHistoryProps) => {
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(
    null,
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deletingDocumentId, setDeletingDocumentId] = useState<string | null>(
    null,
  );
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

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
    if (!isMounted) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleDeleteDocument = async (documentId: string) => {
    if (!userId) return;

    setDeletingDocumentId(documentId);
    try {
      await deleteDocument(documentId, userId);
      onDocumentDeleted();
    } catch (error) {
      console.error("Error deleting document:", error);
    } finally {
      setDeletingDocumentId(null);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  if (!isMounted) {
    return (
      <Card className="h-full bg-white border-gray-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-medium flex items-center gap-2">
            <Clock className="h-5 w-5 text-gray-500" />
            Document History
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="h-[500px] flex items-center justify-center">
            <div className="animate-pulse flex flex-col items-center">
              <div className="h-12 w-12 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 w-32 bg-gray-200 rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full bg-white border-gray-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium flex items-center gap-2">
            <Clock className="h-5 w-5 text-gray-500" />
            Document History
          </CardTitle>
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <List className="h-4 w-4" />
                View All
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <File className="h-5 w-5" />
                  All Documents ({documents.length})
                </DialogTitle>
              </DialogHeader>
              <div className="overflow-auto max-h-[60vh]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Upload Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {documents.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={4}
                          className="text-center py-8 text-gray-500"
                        >
                          <File className="h-12 w-12 mx-auto mb-2 opacity-30" />
                          <p>No documents found</p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      documents.map((document) => (
                        <TableRow key={document.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getStatusIcon(document.status)}
                              <span className="font-medium">
                                {document.name}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(document.status)}
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-gray-600">
                              {formatDate(document.date)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  handleSelectDocument(document.id);
                                  setIsModalOpen(false);
                                }}
                              >
                                View
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  handleDeleteDocument(document.id)
                                }
                                disabled={deletingDocumentId === document.id}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                {deletingDocumentId === document.id ? (
                                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
                                ) : (
                                  <Trash2 className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </DialogContent>
          </Dialog>
        </div>
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
