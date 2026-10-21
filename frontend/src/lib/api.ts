import axios from "axios";
import { DashboardData, DocumentItem } from "@/types/analysis";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 120000, // 2 minutes for LLM analysis pipeline
});

export const api = {
  /**
   * Upload a consultation PDF to the backend
   */
  async uploadDocument(file: File): Promise<DocumentItem> {
    const formData = new FormData();
    formData.append("file", file);

    const response = await apiClient.post<DocumentItem>(
      "/documents/upload",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  },

  /**
   * Fetch all uploaded consultation documents
   */
  async listDocuments(): Promise<DocumentItem[]> {
    const response = await apiClient.get<DocumentItem[]>("/documents/");
    return response.data;
  },

  /**
   * Fetch single document metadata
   */
  async getDocument(documentId: string): Promise<DocumentItem> {
    const response = await apiClient.get<DocumentItem>(
      `/documents/${documentId}`
    );
    return response.data;
  },

  /**
   * Delete an uploaded document
   */
  async deleteDocument(documentId: string): Promise<{ document_id: string; filename: string }> {
    const response = await apiClient.delete<{ document_id: string; filename: string }>(
      `/documents/${documentId}`
    );
    return response.data;
  },

  /**
   * Start AI extraction and analysis pipeline
   */
  async startAnalysis(documentId: string): Promise<{
    document_id: string;
    status: string;
    comments_extracted: number;
  }> {
    const response = await apiClient.post(
      `/analysis/${documentId}`
    );
    return response.data;
  },

  /**
   * Fetch full dashboard analytics and parsed comments
   */
  async getDashboard(documentId: string): Promise<DashboardData> {
    const response = await apiClient.get<DashboardData>(
      `/dashboard/${documentId}`
    );
    return response.data;
  },
};
