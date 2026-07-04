"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateChatHistory = void 0;
exports.formatChatHistory = formatChatHistory;
function formatChatHistory(history) {
    if (history.length === 0)
        return '';
    return history
        .map((msg) => {
        const role = msg.role === 'user' ? 'User' : 'Assistant';
        return `${role}: ${msg.content}`;
    })
        .join('\n');
}
const validateChatHistory = (history) => {
    return history && history.length > 0
        ? history
            .filter((msg) => msg && typeof msg.content === 'string' && ['user', 'assistant'].includes(msg.role))
            .slice(-10) // Last 10 messages only for managing the context window
        : [];
};
exports.validateChatHistory = validateChatHistory;
