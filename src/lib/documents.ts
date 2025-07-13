import { supabase } from "./supabase";
import { calculateTokensRequired } from "./auth";
import type { Database } from "./supabase";

type Document = Database["public"]["Tables"]["documents"]["Row"];
type AIReview = Database["public"]["Tables"]["ai_reviews"]["Row"];

export const uploadDocument = async (
  userId: string,
  file: File,
  content: string,
  pageCount: number,
  wordCount: number,
) => {
  try {
    const tokensRequired = calculateTokensRequired(pageCount, wordCount);

    // Check if user has enough tokens
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("tokens")
      .eq("id", userId)
      .single();

    if (userError) throw userError;

    if (userData.tokens < tokensRequired) {
      throw new Error(
        `Insufficient tokens. Required: ${tokensRequired}, Available: ${userData.tokens}`,
      );
    }

    // Upload file to Supabase Storage
    const fileExtension = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExtension}`;
    const filePath = `${userId}/${fileName}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("users-documents")
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    // Get the public URL for the uploaded file
    const {
      data: { publicUrl },
    } = supabase.storage.from("users-documents").getPublicUrl(filePath);

    // Create document record
    const { data: documentData, error: documentError } = await supabase
      .from("documents")
      .insert({
        user_id: userId,
        name: file.name,
        content,
        file_type: file.type,
        file_size: file.size,
        file_url: publicUrl,
        page_count: pageCount,
        word_count: wordCount,
        tokens_used: tokensRequired,
        status: "processing",
      })
      .select()
      .single();

    if (documentError) {
      // If document creation fails, clean up the uploaded file
      await supabase.storage.from("users-documents").remove([filePath]);
      throw documentError;
    }

    // Deduct tokens from user
    const { error: tokenError } = await supabase
      .from("users")
      .update({ tokens: userData.tokens - tokensRequired })
      .eq("id", userId);

    if (tokenError) throw tokenError;

    return documentData;
  } catch (error) {
    console.error("Upload document error:", error);
    throw error;
  }
};

export const getUserDocuments = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from("documents")
      .select(
        `
        *,
        ai_reviews (*)
      `,
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return data;
  } catch (error) {
    console.error("Get user documents error:", error);
    throw error;
  }
};

export const getDocumentWithReview = async (
  documentId: string,
  userId: string,
) => {
  try {
    const { data, error } = await supabase
      .from("documents")
      .select(
        `
        *,
        ai_reviews (*)
      `,
      )
      .eq("id", documentId)
      .eq("user_id", userId)
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error("Get document with review error:", error);
    throw error;
  }
};

export const createAIReview = async (
  documentId: string,
  reviewData: {
    summary: string;
    good_clauses: any[];
    concerning_clauses: any[];
    problematic_clauses: any[];
    legal_implications: string;
    overall_status: "good" | "concerning" | "problematic";
  },
) => {
  try {
    const { data, error } = await supabase
      .from("ai_reviews")
      .insert({
        document_id: documentId,
        ...reviewData,
      })
      .select()
      .single();

    if (error) throw error;

    // Update document status to completed
    await supabase
      .from("documents")
      .update({ status: "completed" })
      .eq("id", documentId);

    return data;
  } catch (error) {
    console.error("Create AI review error:", error);
    throw error;
  }
};

export const simulateAIAnalysis = async (
  documentId: string,
  content: string,
) => {
  // Simulate AI processing time
  await new Promise((resolve) => setTimeout(resolve, 3000));

  // Mock AI analysis based on content
  const mockReview = {
    summary:
      "This document contains several standard clauses but has a few concerning elements that should be addressed.",
    good_clauses: [
      {
        id: "g1",
        text: "Standard payment terms with clear due dates",
        explanation: "Properly defines payment obligations and timing",
      },
      {
        id: "g2",
        text: "Clear termination conditions",
        explanation:
          "Provides fair notice requirements for contract termination",
      },
    ],
    concerning_clauses: [
      {
        id: "c1",
        text: "Excessive late fees mentioned in the document",
        explanation: "Late fee amount may be considered unreasonable",
      },
    ],
    problematic_clauses: [
      {
        id: "p1",
        text: "Waiver of certain legal rights",
        explanation:
          "This clause may not be enforceable and could be problematic",
      },
    ],
    legal_implications:
      "The concerning and problematic clauses could expose you to financial risk and limit your legal protections.",
    overall_status: content.toLowerCase().includes("problematic")
      ? ("problematic" as const)
      : content.toLowerCase().includes("concerning")
        ? ("concerning" as const)
        : ("good" as const),
  };

  return await createAIReview(documentId, mockReview);
};

export const deleteDocument = async (documentId: string, userId: string) => {
  try {
    // Get document details first
    const { data: document, error: fetchError } = await supabase
      .from("documents")
      .select("file_url, user_id")
      .eq("id", documentId)
      .eq("user_id", userId)
      .single();

    if (fetchError) throw fetchError;

    // Delete AI reviews first (due to foreign key constraint)
    const { error: reviewsError } = await supabase
      .from("ai_reviews")
      .delete()
      .eq("document_id", documentId);

    if (reviewsError) throw reviewsError;

    // Delete document record
    const { error: documentError } = await supabase
      .from("documents")
      .delete()
      .eq("id", documentId)
      .eq("user_id", userId);

    if (documentError) throw documentError;

    // Delete file from storage if it exists
    if (document.file_url) {
      // Extract the file path from the URL
      const urlParts = document.file_url.split("/");
      const fileName = urlParts[urlParts.length - 1];
      const filePath = `${userId}/${fileName}`;
      await supabase.storage.from("users-documents").remove([filePath]);
    }

    return { success: true };
  } catch (error) {
    console.error("Delete document error:", error);
    throw error;
  }
};

export const extractTextFromFile = async (
  file: File,
): Promise<{ content: string; pageCount: number; wordCount: number }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const content = e.target?.result as string;

      // Simple word count
      const wordCount = content
        .split(/\s+/)
        .filter((word) => word.length > 0).length;

      // Estimate page count (assuming ~250 words per page)
      const pageCount = Math.max(1, Math.ceil(wordCount / 250));

      resolve({ content, pageCount, wordCount });
    };

    reader.onerror = () => {
      reject(new Error("Failed to read file"));
    };

    if (file.type === "text/plain") {
      reader.readAsText(file);
    } else {
      // For other file types, we'll use a placeholder
      // In a real app, you'd use libraries like pdf-parse for PDFs
      const mockContent = `Document content from ${file.name}. This is a placeholder for actual document parsing.`;
      const wordCount = mockContent.split(/\s+/).length;
      const pageCount = Math.max(1, Math.ceil(file.size / 2000)); // Rough estimate based on file size

      resolve({ content: mockContent, pageCount, wordCount });
    }
  });
};

// Feedback functions
export const submitFeedback = async (
  userId: string,
  documentId: string,
  aiReviewId: string,
  feedbackType: "thumbs_up" | "thumbs_down",
) => {
  try {
    const { data, error } = await supabase
      .from("feedback")
      .upsert(
        {
          user_id: userId,
          document_id: documentId,
          ai_review_id: aiReviewId,
          feedback_type: feedbackType,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "user_id,ai_review_id",
        },
      )
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Submit feedback error:", error);
    throw error;
  }
};

export const getFeedback = async (
  userId: string,
  aiReviewId: string,
): Promise<Database["public"]["Tables"]["feedback"]["Row"] | null> => {
  try {
    const { data, error } = await supabase
      .from("feedback")
      .select("*")
      .eq("user_id", userId)
      .eq("ai_review_id", aiReviewId)
      .single();

    if (error && error.code !== "PGRST116") {
      // PGRST116 is "not found" error, which is expected when no feedback exists
      throw error;
    }

    return data || null;
  } catch (error) {
    console.error("Get feedback error:", error);
    throw error;
  }
};
