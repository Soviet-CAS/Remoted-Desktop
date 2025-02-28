const WebSocket = require("ws");
const http = require("http");
const { v4: uuidv4 } = require("uuid");  // Generates unique IDs

const server = http.createServer(); 
const wss  = new WebSocket.Server({ server });
const clients = {};  // Store Remote ID → WebSocket mapping

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

// Use port 8080 or any free port
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => console.log(`WebSocket server running on port ${PORT}`));