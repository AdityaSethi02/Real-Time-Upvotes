
import {OutgoingMessage, SupportedMessage as OutgoingSupportedMessages} from "./messages/outgoingMessages";
import {connection, server as WebSocketServer} from "websocket";
import http from "http";
import { IncomingMessage, SupportedMessage } from "./messages/incomingMessages";
import { UserManager } from "./UserManager";
import { InMemoryStore } from "./store/InMemoryStore";
import { config } from 'dotenv';

config();

const server = http.createServer(function(request: any, response: any) {
    console.log((new Date()) + ' Received request for ' + request.url);
    response.writeHead(404);
    response.end();
});

const userManager = new UserManager();
const store = new InMemoryStore();

const PORT = process.env.PORT;
server.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});

const wsServer = new WebSocketServer({
    httpServer: server,
    autoAcceptConnections: false
});

function originIsAllowed(origin: string) {
    return true;
}

wsServer.on('request', function(request: any) {
    if (!originIsAllowed(request.origin)) {
        request.reject();
        console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
        return;
    }

    var connection = request.accept(null, request.origin);
    console.log((new Date()) + ' Connection accepted.');
    connection.on('message', function(message: any) {
        // Todo: add rate limiting here
        if (message.type === 'utf8') {
            try {
                messageHandler(connection, JSON.parse(message.utf8Data));
            } catch (error) {

            }
        }
    });
});

function messageHandler(ws: connection, message: IncomingMessage) {
    if (message.type === SupportedMessage.JoinRoom) {
        const payload = message.payload;
        userManager.addUser(payload.name, payload.userId, payload.roomId, ws);
    }

    const user = userManager.getUser(message.payload.roomId, message.payload.userId);

    if (!user) {
        console.error("No user found")
        return;
    }

    const currTime = Date.now();
    const coolDownTime = 30000;

    if (user.lastMessageTime && currTime - user.lastMessageTime < coolDownTime) {
        ws.sendUTF(JSON.stringify({
            type: "COOL_DOWN",
            payload: {
                message: "Please wait before sending another message"
            }
        }));
        return;
    }

    user.lastMessageTime = currTime;

    if (message.type === SupportedMessage.SendMessage) {
        const payload = message.payload;
        const user = userManager.getUser(payload.roomId, payload.userId);

        if (!user) {
            console.error("No user found")
            return;
        }

        let chat = store.addChats(payload.userId, user.name, payload.roomId, payload.message);

        if (!chat) {
            console.error("No chat found")
            return;
        }

        const outgoingPayload: OutgoingMessage = {
            type: OutgoingSupportedMessages.AddChat,
            payload: {
                chatId: chat.id,
                roomId: payload.roomId,
                message: payload.message,
                name: user.name,
                upVotes: 0
            }
        }
        userManager.broadcast(payload.roomId, payload.userId, outgoingPayload);
    }

    if (message.type === SupportedMessage.UpvoteMessage) {
        const payload = message.payload;
        const chat = store.upVote(payload.userId, payload.roomId, payload.chatId);

        if (!chat) {
            console.error("No chat found")
            return;
        }

        const outgoingPayload: OutgoingMessage = {
            type: OutgoingSupportedMessages.UpdateChat,
            payload: {
                chatId: payload.chatId,
                roomId: payload.roomId,
                upVotes: chat.upVotes.length
            }
        }
        userManager.broadcast(payload.roomId, payload.userId, outgoingPayload);
    }
}
