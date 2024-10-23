import { connection } from "websocket";
import { OutgoingMessage } from "./messages/outgoingMessages";

interface User {
    name: string;
    id: string;
    conn: connection;
}

interface Room {
    users: User[];

}

export class UserManager {
    private rooms: Map<string, Room>;
    constructor() {
        this.rooms = new Map<string, Room>();
    }

    addUser(userId: string, roomId: string, name: string, socket: connection) {
        if (!this.rooms.get(roomId)) {
            this.rooms.set(roomId, {
                users: []
            });
        }

        this.rooms.get(roomId)?.users.push({
            name,
            id: userId,
            conn: socket
        });
        socket.on('close', (reasonCode, description) => {
            this.removeUser(roomId, userId);
        });
    }

    removeUser(userId: string, roomId: string) {
        console.log("REMOVED USER");

        const users = this.rooms.get(roomId)?.users;

        if (users) {
            users.filter(({id}) => id !== userId);
        }
    }

    getUser(userId: string, roomId: string): User | null {
        const user = this.rooms.get(roomId)?.users.find(({id}) => id === userId);

        return user ?? null;
    }

    broadcast(roomId: string, userId: string, message: OutgoingMessage) {
        const user = this.getUser(userId, roomId);

        if (!user) {
            console.error("User not found");
            return;
        }

        const room = this.rooms.get(roomId);

        if (!room) {
            console.error("Room not found");
            return;
        }

        room.users.forEach(({conn, id}) => {
            if (id === userId) {
                return;
            }

            console.log("OUTGOING MESSAGE: ", JSON.stringify(message));
            conn.send(JSON.stringify(message));
        });
    }
}