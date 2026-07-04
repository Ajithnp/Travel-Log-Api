import { ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';

export interface IAIProvider {
  getChatModel(): ChatGoogleGenerativeAI;
  getEmbeddingModel(): GoogleGenerativeAIEmbeddings;
}
