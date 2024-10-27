import { Chat, Store, UserId } from "./Store";

let globalChatId = 1;

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

    getChats (roomId: string, limit: number, offset: number) {
        const room = this.store.get(roomId);

        if (!room) {
            return [];
        }

        return room.chats.reverse().slice(0, offset).slice(-1 * limit);
    }

    addChats (userId: UserId, name: string, roomId: string, message: string) {
        if (!this.store.get(roomId)) {
            this.initRoom(roomId);
        }
        
        const room = this.store.get(roomId);

        if (!room) {
            return;
        }

        const chat = {
            id: (globalChatId++).toString(),
            userId,
            name,
            message,
            upVotes: []
        }

        room.chats.push(chat);
        return chat;


    }

    upVote (userId: UserId, roomId: string, chatId: string) {
        const room = this.store.get(roomId);

        if (!room) {
            return;
        }

        // Todo: make this faster
        const chat = room.chats.find(({ id }) => id == chatId);

        if (chat) {
            chat.upVotes.push(userId);
        }

        return chat;
    }
}