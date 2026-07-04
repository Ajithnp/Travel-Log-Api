import { ChatMessage } from '../../shared/utils/format-ai-chat-history';

export interface IRagService {
  askChatbot(userMessage: string, chatHistory?: ChatMessage[]): Promise<string>;
}
