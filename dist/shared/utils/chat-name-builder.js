"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateChatName = void 0;
const generateChatName = (packageTitle, startDate) => {
    const cleanedTitle = packageTitle.split(/[-–|:,]/)[0].trim();
    const shortTitle = cleanedTitle.length > 28 ? cleanedTitle.slice(0, 28).trim() + '...' : cleanedTitle;
    const date = new Date(startDate);
    const formattedDate = new Intl.DateTimeFormat('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        timeZone: 'UTC',
    }).format(date);
    return `${shortTitle} • ${formattedDate}`;
};
exports.generateChatName = generateChatName;
