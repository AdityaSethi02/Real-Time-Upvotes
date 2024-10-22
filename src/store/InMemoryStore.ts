import { Chat, Store } from "./Store";

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

    getChats(roomId: string, limit: number, offset: number) {

    }

    addChat(roomId: string, limit: number, offset: number) {

    }

    upvote(roomId: string, chatId: string) {

    }
}