"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatMapper = void 0;
class ChatMapper {
    static toChatRoomDTO(chat) {
        return {
            id: chat._id.toString(),
            chatName: chat.chatName,
            scheduleId: chat.scheduleId.toString(),
            packageId: chat.packageId.toString(),
            vendorId: chat.vendorId.toString(),
            members: chat.members.map((m) => ({
                userId: m.userId.toString(),
                isActive: m.isActive,
            })),
            status: chat.status,
            pinnedMessage: chat.pinnedMessage,
            createdAt: chat.createdAt,
        };
    }
    static toChatRoomWithPreviewDTO(chat, lastMessage) {
        return Object.assign(Object.assign({}, ChatMapper.toChatRoomDTO(chat)), { lastMessage: lastMessage ? ChatMapper.toMessageDTO(lastMessage) : null });
    }
    static toMessageDTO(message) {
        return {
            id: message._id.toString(),
            chatId: message.chatId.toString(),
            senderId: message.senderId.toString(),
            senderRole: message.senderRole,
            senderName: message.senderName,
            content: message.content,
            createdAt: message.createdAt,
        };
    }
    static toChatMemberDetailDTO(member) {
        return {
            id: member.userId._id.toString(),
            name: member.userId.name,
            status: member.isActive ? true : false,
        };
    }
    static toChatMemberDetailDTOList(chat) {
        return chat.members.map(ChatMapper.toChatMemberDetailDTO);
    }
}
exports.ChatMapper = ChatMapper;
