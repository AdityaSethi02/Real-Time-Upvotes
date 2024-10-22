
type UserId = string;

export interface Chat {
    userId: UserId;
    name: string;
    message: string;
    upvotes: UserId[];
}

export abstract class Store {
    constructor() {

    }

    initRoom(roomId: string) {

    }

    getChats(roomId: string, limit: number, offset: number) {

    }

    addChat(roomId: string, limit: number, offset: number) {

    }

    upvote(roomId: string, chatId: string) {

    }
}