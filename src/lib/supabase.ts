import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string;
          country: string | null;
          tokens: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          name: string;
          country?: string | null;
          tokens?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          country?: string | null;
          tokens?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      documents: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          content: string;
          file_type: string;
          file_size: number;
          file_url: string | null;
          page_count: number;
          word_count: number;
          tokens_used: number;
          status: "pending" | "processing" | "completed" | "error";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          content: string;
          file_type: string;
          file_size: number;
          file_url?: string | null;
          page_count?: number;
          word_count?: number;
          tokens_used?: number;
          status?: "pending" | "processing" | "completed" | "error";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          content?: string;
          file_type?: string;
          file_size?: number;
          file_url?: string | null;
          page_count?: number;
          word_count?: number;
          tokens_used?: number;
          status?: "pending" | "processing" | "completed" | "error";
          created_at?: string;
          updated_at?: string;
        };
      };
      ai_reviews: {
        Row: {
          id: string;
          document_id: string;
          summary: string | null;
          good_clauses: any[];
          concerning_clauses: any[];
          problematic_clauses: any[];
          legal_implications: string | null;
          overall_status: "good" | "concerning" | "problematic";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          document_id: string;
          summary?: string | null;
          good_clauses?: any[];
          concerning_clauses?: any[];
          problematic_clauses?: any[];
          legal_implications?: string | null;
          overall_status?: "good" | "concerning" | "problematic";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          document_id?: string;
          summary?: string | null;
          good_clauses?: any[];
          concerning_clauses?: any[];
          problematic_clauses?: any[];
          legal_implications?: string | null;
          overall_status?: "good" | "concerning" | "problematic";
          created_at?: string;
          updated_at?: string;
        };
      };
      feedback: {
        Row: {
          id: string;
          user_id: string;
          document_id: string;
          ai_review_id: string;
          feedback_type: "thumbs_up" | "thumbs_down";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          document_id: string;
          ai_review_id: string;
          feedback_type: "thumbs_up" | "thumbs_down";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          document_id?: string;
          ai_review_id?: string;
          feedback_type?: "thumbs_up" | "thumbs_down";
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
};
