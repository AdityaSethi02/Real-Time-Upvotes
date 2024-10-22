import { Chat, Store, UserId } from "./Store";

let globalChatId = 0;

export interface Room {
    roomId: string;
    chats: Chat[];
}

export class InMemoryStore implements Store {
    private store: Map<string, Room>;
    constructor() {
        this.store = new Map<string, Room>();
    }

    initRoom(roomId: string) {
        this.store.set(roomId, {
            roomId,
            chats: []
        });
    }

    // last 50 chats => limit: 50, offset: 0
    // next 50 chats => limit: 50, offset: 50
    getChats(roomId: string, limit: number, offset: number) {
        const room = this.store.get(roomId);

        if (!room) {
            return [];
        }

        return room.chats.slice(offset, offset + limit);
    }

    addChat(userId: UserId, name: string, roomId: string, message: string) {
        const room = this.store.get(roomId);

        if (!room) {
            return;
        }

        room.chats.push({
            chatId: (globalChatId++).toString(),
            userId,
            name,
            message,
            upvotes: []
        });

    }

    upvote(userId: UserId, roomId: string, chatId: string) {
        const room = this.store.get(roomId);

        if (!room) {
            return;
        }

        const chat = room.chats.find(({chatId}) => chatId === chatId);

        if (chat) {
            chat.upvotes.push(userId);
        }
    }
}