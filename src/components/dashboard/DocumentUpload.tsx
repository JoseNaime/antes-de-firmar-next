"use client";

import { useState, useCallback } from "react";
import {
  Upload,
  FileText,
  AlertCircle,
  CheckCircle,
  Coins,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/components/auth/AuthProvider";
import { supabase } from "@/lib/supabase";
import { uploadDocument } from "@/lib/documents";

interface DocumentUploadProps {
  onUploadComplete?: (documentId: string) => void;
  onAnalysisComplete?: () => void;
}

export default function DocumentUpload({
  onUploadComplete = () => {},
  onAnalysisComplete = () => {},
}: DocumentUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<
    "idle" | "scanning" | "uploading" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [scanResults, setScanResults] = useState<{
    pageCount: number;
    wordCount: number;
    tokensRequired: number;
  } | null>(null);
  const [documentType, setDocumentType] = useState<string>("");
  const [context, setContext] = useState<string>("");

  const { toast } = useToast();

  const allowedFileTypes = [".pdf", ".doc", ".docx", ".txt"];

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const validateFile = (file: File): boolean => {
    const extension = `.${file.name.split(".").pop()?.toLowerCase()}`;

    if (!allowedFileTypes.includes(extension)) {
      setErrorMessage(
        `Invalid file type. Please upload ${allowedFileTypes.join(", ")} files only.`,
      );
      setUploadStatus("error");
      return false;
    }

    if (file.size > 10 * 1024 * 1024) {
      // 10MB limit
      setErrorMessage("File size exceeds 10MB limit.");
      setUploadStatus("error");
      return false;
    }

    return true;
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && validateFile(droppedFile)) {
      setFile(droppedFile);
      scanFile(droppedFile);
    }
  }, []);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      e.preventDefault();
      if (e.target.files && e.target.files[0]) {
        const selectedFile = e.target.files[0];
        if (validateFile(selectedFile)) {
          setFile(selectedFile);
          scanFile(selectedFile);
        }
      }
    },
    [],
  );

  const { user } = useAuth();

  // Call external API to scan file
  const scanFile = async (file: File) => {
    if (!user) {
      setErrorMessage("Please log in to upload documents.");
      setUploadStatus("error");
      return;
    }

    setUploadStatus("scanning");
    setErrorMessage("");

    try {
      // Get user's auth token
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.access_token) {
        setErrorMessage("Authentication required. Please log in again.");
        setUploadStatus("error");
        return;
      }

      // Prepare form data
      const formData = new FormData();
      formData.append("file", file);

      console.log(session.access_token);

      for (const [key, value] of formData.entries()) {
        console.log(key, value);
      }

      // Call external API with proper headers to prevent caching
      const response = await fetch(
        "https://8cf2746fa256.ngrok-free.app/api/v1/getfileinfo",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            "Cache-Control": "no-cache",
            Pragma: "no-cache",
          },
          body: formData,
        },
      );

      if (!response.ok) {
        throw new Error(
          `API request failed: ${response.status} ${response.statusText}`,
        );
      }

      const apiResponse = await response.json();

      console.log(apiResponse);

      // Check if file is suitable for AI analysis
      if (apiResponse.is_suitable_for_ai === false) {
        setErrorMessage(
          "We apologize, but this file format is not supported for AI analysis. Please try again with a different format (PDF, DOC, DOCX, or TXT) or ensure your document contains readable text content.",
        );
        setUploadStatus("error");
        toast({
          variant: "destructive",
          title: "File Not Supported",
          description:
            "This file cannot be analyzed by our AI. Please try a different format.",
        });
        return;
      }

      // Extract data from API response
      const pageCount = apiResponse.pages;
      const wordCount = apiResponse.words;
      const tokensRequired = apiResponse.tokens_required;

      setScanResults({ pageCount, wordCount, tokensRequired });

      // Check if user has enough tokens
      if (user.tokens < tokensRequired) {
        const missingTokens = tokensRequired - user.tokens;
        setErrorMessage(
          `Insufficient tokens. You need ${missingTokens} more tokens to proceed with this upload.`,
        );
        setUploadStatus("error");
        toast({
          variant: "destructive",
          title: "Insufficient Tokens",
          description: `You need ${missingTokens} more tokens to analyze this document.`,
        });
        return;
      }

      // Show confirmation dialog
      setUploadStatus("idle");
      setShowConfirmDialog(true);
    } catch (error: any) {
      console.error("Scan file error:", error);
      setErrorMessage(error.message || "File scan failed. Please try again.");
      setUploadStatus("error");
      toast({
        variant: "destructive",
        title: "Scan Failed",
        description: "Failed to scan the file. Please try again.",
      });
    }
  };

  const handleConfirmUpload = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (!file || !scanResults || !user || !documentType) return;

    setShowConfirmDialog(false);
    simulateUpload(file, scanResults, documentType, context);
  };

  const handleCancelUpload = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    setShowConfirmDialog(false);
    resetUpload();
  };

  const simulateUpload = async (
    file: File,
    scanData: { pageCount: number; wordCount: number; tokensRequired: number },
    documentType: string,
    context: string,
  ) => {
    setUploadStatus("uploading");
    setUploadProgress(0);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 70) {
            clearInterval(progressInterval);
            return 70;
          }
          return prev + 10;
        });
      }, 300);

      // Upload document to storage and database (content will be extracted server-side)
      const document = await uploadDocument(
        user.id,
        file,
        "", // Empty content for now, will be populated by server
        scanData.pageCount,
        scanData.wordCount,
      );

      console.log("document upload: ", document);

      clearInterval(progressInterval);
      setUploadProgress(100);
      setUploadStatus("success");

      // Start AI analysis in background
      performAIAnalysis(document.id, file, documentType, context).catch(
        console.error,
      );

      toast({
        title: "Upload Successful",
        description:
          "Your document has been uploaded and analysis has started.",
      });

      onUploadComplete(document.id);
    } catch (error: any) {
      setErrorMessage(error.message || "Upload failed. Please try again.");
      setUploadStatus("error");
      toast({
        variant: "destructive",
        title: "Upload Failed",
        description: error.message || "Upload failed. Please try again.",
      });
    }
  };

  const performAIAnalysis = async (
    documentId: string,
    file: File,
    documentType: string,
    context: string,
  ) => {
    try {
      // Get user's auth token
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.access_token) {
        console.error("Authentication required for AI analysis");
        return;
      }

      // Prepare form data
      const formData = new FormData();
      formData.append("document_id", documentId);
      formData.append("file", file);
      formData.append("document_type", documentType);
      formData.append("context", context);

      // Call AI analysis API with proper headers to prevent caching
      const response = await fetch(
        "https://8cf2746fa256.ngrok-free.app/api/v1/analyze",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            "Cache-Control": "no-cache",
            Pragma: "no-cache",
          },
          body: formData,
        },
      );

      if (!response.ok) {
        throw new Error(
          `AI analysis failed: ${response.status} ${response.statusText}`,
        );
      }

      const analysisResult = await response.json();
      console.log("AI Analysis completed:", analysisResult);

      // Update document status to completed
      await supabase
        .from("documents")
        .update({ status: "completed" })
        .eq("id", documentId);

      console.log("Analyzis complete Toast trigger");
      toast({
        title: "Analysis Complete",
        description: "Your document has been successfully analyzed.",
      });

      // Trigger document history refresh
      onAnalysisComplete();
    } catch (error: any) {
      console.error("AI Analysis error:", error);

      // Update document status to failed
      await supabase
        .from("documents")
        .update({ status: "failed" })
        .eq("id", documentId);

      toast({
        variant: "destructive",
        title: "Analysis Failed",
        description: error.message || "AI analysis failed. Please try again.",
      });

      // Trigger document history refresh even on failure to update status
      onAnalysisComplete();
    }
  };

  const resetUpload = () => {
    setFile(null);
    setUploadProgress(0);
    setUploadStatus("idle");
    setErrorMessage("");
    setScanResults(null);
    setShowConfirmDialog(false);
    setDocumentType("");
    setContext("");
  };

  return (
    <Card className="w-full max-w-3xl mx-auto bg-white">
      <CardContent className="p-6">
        <div className="mb-4">
          <h2 className="text-2xl font-semibold text-gray-800">
            Upload Legal Document
          </h2>
          <p className="text-gray-500">Upload your document for AI analysis</p>
        </div>

        {uploadStatus === "error" && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        {uploadStatus === "success" ? (
          <div className="flex flex-col items-center justify-center p-6 border-2 border-green-500 border-dashed rounded-lg bg-green-50">
            <CheckCircle className="h-12 w-12 text-green-500 mb-2" />
            <p className="text-lg font-medium text-green-700">
              Upload Complete!
            </p>
            <p className="text-sm text-green-600 mb-4">{file?.name}</p>
            <Button
              onClick={(e) => {
                e.preventDefault();
                resetUpload();
              }}
              variant="outline"
            >
              Upload Another Document
            </Button>
          </div>
        ) : (
          <div
            className={`flex flex-col items-center justify-center p-6 border-2 ${isDragging ? "border-primary" : "border-gray-300"} border-dashed rounded-lg ${isDragging ? "bg-primary/5" : "bg-gray-50"} transition-colors duration-200`}
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {uploadStatus === "scanning" ? (
              <div className="w-full">
                <div className="flex items-center justify-center mb-4">
                  <FileText className="h-10 w-10 text-primary animate-pulse" />
                </div>
                <p className="text-center mb-2">{file?.name}</p>
                <div className="flex items-center justify-center mb-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
                <p className="text-center text-sm text-gray-500">
                  Scanning document for analysis...
                </p>
              </div>
            ) : uploadStatus === "uploading" ? (
              <div className="w-full">
                <div className="flex items-center justify-center mb-4">
                  <FileText className="h-10 w-10 text-primary animate-pulse" />
                </div>
                <p className="text-center mb-2">{file?.name}</p>
                <Progress value={uploadProgress} className="mb-2" />
                <p className="text-center text-sm text-gray-500">
                  {uploadProgress}% uploaded
                </p>
              </div>
            ) : (
              <>
                <Upload className="h-12 w-12 text-gray-400 mb-4" />
                <p className="text-lg font-medium text-gray-700 mb-1">
                  Drag and drop your document here
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  or click to browse files
                </p>
                <p className="text-xs text-gray-400 mb-4">
                  Supported formats: PDF, DOC, DOCX, TXT (Max 10MB)
                </p>
                <div className="relative">
                  <Button type="button">Browse Files</Button>
                  <input
                    type="file"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={handleFileSelect}
                    accept=".pdf,.doc,.docx,.txt"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              </>
            )}
          </div>
        )}

        {/* Confirmation Dialog */}
        <AlertDialog
          open={showConfirmDialog}
          onOpenChange={setShowConfirmDialog}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <Coins className="h-5 w-5 text-primary" />
                Confirm Document Upload
              </AlertDialogTitle>
              <AlertDialogDescription>
                <div className="space-y-4">
                  <p>Document scan completed. Here are the details:</p>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium">File:</span>
                      <span>{file?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Pages:</span>
                      <span>{scanResults?.pageCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Words:</span>
                      <span>{scanResults?.wordCount}</span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span className="font-medium text-primary">
                        Tokens Required:
                      </span>
                      <span className="font-bold text-primary">
                        {scanResults?.tokensRequired}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Your Balance:</span>
                      <span
                        className={
                          user &&
                          scanResults &&
                          user.tokens >= scanResults.tokensRequired
                            ? "text-green-600"
                            : "text-red-600"
                        }
                      >
                        {user?.tokens} tokens
                      </span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="document-type">Document Type *</Label>
                      <Select
                        value={documentType}
                        onValueChange={setDocumentType}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select document type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="finance">Finance</SelectItem>
                          <SelectItem value="work">Work</SelectItem>
                          <SelectItem value="rent">Rent</SelectItem>
                          <SelectItem value="legal">Legal</SelectItem>
                          <SelectItem value="insurance">Insurance</SelectItem>
                          <SelectItem value="contract">Contract</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="context">Context (Optional)</Label>
                      <Input
                        id="context"
                        placeholder="Brief description or additional context..."
                        value={context}
                        onChange={(e) => setContext(e.target.value)}
                        maxLength={200}
                      />
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground">
                    Do you want to proceed with the upload and analysis?
                  </p>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={handleCancelUpload}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirmUpload}
                disabled={!documentType}
              >
                Proceed with Upload
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}
