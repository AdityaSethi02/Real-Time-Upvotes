import {connection, server as WebSocketServer} from "websocket"
import http from "http"
import { IncomingMessage, SupportedMessageTypes } from "./messages/incomingMessages";
import { OutgoingMessage, SupportedMessageTypes as OutgoingSupportedMessage} from "./messages/outgoingMessages";
import { UserManager } from "./UserManager";
import { InMemoryStore } from "./store/InMemoryStore";

const server = http.createServer(function(request, response) {
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

wsServer.on('request', function(request) {
    if (!originIsAllowed(request.origin)) {
      request.reject();
      console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
      return;
    }

    var connection = request.accept('echo-protocol', request.origin);
    console.log((new Date()) + ' Connection accepted.');
    connection.on('message', function(message) {
        // Todo: add rate limiting logic here
        if (message.type === 'utf8') {
            try {
                messageHandler(connection, JSON.parse(message.utf8Data));
            } catch(error) {

            }
        }
        else if (message.type === 'binary') {
            console.log('Received Binary Message of ' + message.binaryData.length + ' bytes');
            connection.sendBytes(message.binaryData);
        }
    });
    connection.on('close', function(reasonCode, description) {
        console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
    });
});

function messageHandler(ws: connection, message: IncomingMessage) {
    if (message.type == SupportedMessageTypes.JoinRoom) {
        const payload = message.payload;
        userManager.addUser(payload.userId, payload.roomId, payload.name, ws);
    }

    if (message.type == SupportedMessageTypes.SendMessage) {
        const payload = message.payload;
        const user = userManager.getUser(payload.userId, payload.roomId);

        if (!user) {
            console.error("User not found");
            return;
        }

        store.addChat(payload.userId, user.name, payload.roomId, payload.message);
        const outgoingPayload: OutgoingMessage = {
            type: OutgoingSupportedMessage.AddChat,
            payload: {
                roomId: payload.roomId,
                message: payload.message,
                name: user.name,
                upvotes: 0
            }
        }
        userManager.broadcast(payload.roomId, payload.userId, outgoingPayload);
    }

    if (message.type == SupportedMessageTypes.UpvoteMessage) {
        const payload = message.payload;
        store.upvote(payload.userId, payload.roomId, payload.chatId);
    }
}