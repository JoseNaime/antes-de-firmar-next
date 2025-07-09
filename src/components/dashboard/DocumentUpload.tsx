"use client";

import { useState, useCallback } from "react";
import { Upload, FileText, AlertCircle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/components/auth/AuthProvider";
import {
  uploadDocument,
  extractTextFromFile,
  simulateAIAnalysis,
} from "@/lib/documents";

interface DocumentUploadProps {
  onUploadComplete?: (documentId: string) => void;
}

export default function DocumentUpload({
  onUploadComplete = () => {},
}: DocumentUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<
    "idle" | "uploading" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");

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
      simulateUpload(droppedFile);
    }
  }, []);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
        const selectedFile = e.target.files[0];
        if (validateFile(selectedFile)) {
          setFile(selectedFile);
          simulateUpload(selectedFile);
        }
      }
    },
    [],
  );

  const { user } = useAuth();

  const simulateUpload = async (file: File) => {
    if (!user) {
      setErrorMessage("Please log in to upload documents.");
      setUploadStatus("error");
      return;
    }

    setUploadStatus("uploading");
    setUploadProgress(0);

    try {
      // Extract text and metadata from file
      const { content, pageCount, wordCount } = await extractTextFromFile(file);

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Upload document to database
      const document = await uploadDocument(
        user.id,
        file,
        content,
        pageCount,
        wordCount,
      );

      setUploadProgress(100);
      setUploadStatus("success");

      // Start AI analysis in background
      simulateAIAnalysis(document.id, content).catch(console.error);

      onUploadComplete(document.id);
    } catch (error: any) {
      setErrorMessage(error.message || "Upload failed. Please try again.");
      setUploadStatus("error");
    }
  };

  const resetUpload = () => {
    setFile(null);
    setUploadProgress(0);
    setUploadStatus("idle");
    setErrorMessage("");
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
            <Button onClick={resetUpload} variant="outline">
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
            {uploadStatus === "uploading" ? (
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
                  <Button>Browse Files</Button>
                  <input
                    type="file"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={handleFileSelect}
                    accept=".pdf,.doc,.docx,.txt"
                  />
                </div>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
