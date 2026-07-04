export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export function formatChatHistory(history: ChatMessage[]): string {
  if (history.length === 0) return '';

  return history
    .map((msg: ChatMessage) => {
      const role = msg.role === 'user' ? 'User' : 'Assistant';
      return `${role}: ${msg.content}`;
    })
    .join('\n');
}

export const validateChatHistory = (history: ChatMessage[]): ChatMessage[] => {
  return history && history.length > 0
    ? history
        .filter(
          (msg: ChatMessage) =>
            msg && typeof msg.content === 'string' && ['user', 'assistant'].includes(msg.role),
        )
        .slice(-10) // Last 10 messages only for managing the context window
    : [];
};
