
import {OutgoingMessage, SupportedMessage as OutgoingSupportedMessages} from "./messages/outgoingMessages";
import {connection, server as WebSocketServer} from "websocket";
import http from "http";
import { IncomingMessage, SupportedMessage } from "./messages/incomingMessages";
import { UserManager } from "./UserManager";
import { InMemoryStore } from "./store/InMemoryStore";

const server = http.createServer(function(request: any, response: any) {
    console.log((new Date()) + ' Received request for ' + request.url);
    response.writeHead(404);
    response.end();
});

const userManager = new UserManager();
const store = new InMemoryStore();

server.listen(8080, function() {
    console.log((new Date()) + ' Server is listening on port 8080');
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

    var connection = request.accept('echo-protocol', request.origin);
    console.log((new Date()) + ' Connection accepted.');
    connection.on('message', function(message: any) {
        console.log("message", message);
        // Todo: add rate limiting here
        if (message.type === 'utf8') {
            try {
                console.log("INDIE MSG: ", message.utf8Data);
                messageHandler(connection, JSON.parse(message.utf8Data));
            } catch (error) {

            }
        }
    });
});

function messageHandler(ws: connection, message: IncomingMessage) {
    console.log("INCOMING MSG: ", JSON.stringify(message));
    if (message.type === SupportedMessage.JoinRoom) {
        const payload = message.payload;
        userManager.addUser(payload.name, payload.userId, payload.roomId, ws);
    }

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