const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const { v4: uuidv4 } = require("uuid");  // Generates unique IDs

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ noServer: true });
const clients = {};  // Store Remote ID → WebSocket mapping
// Upgrade HTTP to WebSocket
server.on("upgrade", (request, socket, head) => {
    wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit("connection", ws, request);
    });
});

wss.on("connection", (socket) => {
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

app.get("/", (req, res) => {
    res.send("WebSocket Server Running");
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
