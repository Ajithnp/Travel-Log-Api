import { config } from '../../config/env';
import { injectable } from 'tsyringe';
import { ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';
import { TaskType } from '@google/generative-ai';
import { IAIProvider } from './IAiIntegartion';

@injectable()
export class GeminiProvider implements IAIProvider {
  private chatModel: ChatGoogleGenerativeAI;
  private embeddingModel: GoogleGenerativeAIEmbeddings;

  constructor() {
    this.chatModel = new ChatGoogleGenerativeAI({
      model: config.ai.CHAT_MODEL,
      apiKey: config.ai.GEMINI_API_KEY,
      temperature: 0.7,
    });

    this.embeddingModel = new GoogleGenerativeAIEmbeddings({
      model: config.ai.EMBEDDING_MODEL,
      taskType: TaskType.RETRIEVAL_DOCUMENT,
      apiKey: config.ai.GEMINI_API_KEY,
    });
  }

  getChatModel(): ChatGoogleGenerativeAI {
    return this.chatModel;
  }

  getEmbeddingModel(): GoogleGenerativeAIEmbeddings {
    return this.embeddingModel;
  }
}
