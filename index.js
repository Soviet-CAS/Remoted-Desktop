const WebSocket = require("ws");
const { v4: uuidv4 } = require("uuid");  // Generates unique IDs

const server = new WebSocket.Server({ port: 8080 });
const clients = {};  // Store Remote ID → WebSocket mapping

server.on("connection", (socket) => {
    console.log("Client connected");
    const remoteId = uuidv4().split('-')[0]; // Generate a short unique ID
    clients[remoteId] = socket;
    socket.send(JSON.stringify({ remoteId })); // Send Remote ID to client

    socket.on("message", (message) => {
        console.log(`Received: ${message}`);
        const data = JSON.parse(message);

        if (data.to && clients[data.to]) {
            clients[data.to].send(JSON.stringify(data));
        }
    });

    socket.on("close", () => {
        console.log("Client disconnected");
        delete clients[remoteId];
    });
});

console.log("WebSocket server running on ws://localhost:8080");
