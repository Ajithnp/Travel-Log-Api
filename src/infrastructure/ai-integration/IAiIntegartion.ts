import { ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";

export interface AIIntegration {
  getChatModel(): ChatGoogleGenerativeAI;
  getEmbeddingModel(): GoogleGenerativeAIEmbeddings;
}