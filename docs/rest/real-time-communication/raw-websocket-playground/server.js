const WebSocket = require('ws');

// 1. Create a WebSocket server listening on port 8080
const wss = new WebSocket.Server({ port: 8080 });

// This array will manually keep track of all connected clients
const clients = [];

console.log("Raw WebSocket server started on ws://localhost:8080");

// 2. Listen for the 'connection' event (when the HTTP Handshake succeeds)
wss.on('connection', (socket) => {
    console.log("A new client successfully connected!");
    
    // Add the new socket to our manual array
    clients.push(socket);

    // Send a welcome message instantly to just this specific client
    socket.send("Server: Welcome to the raw WebSocket chat!");

    // 3. Listen for incoming messages from this client
    socket.on('message', (message) => {
        const textMessage = message.toString();
        console.log(`Received: ${textMessage}`);
        
        // DIRECT REPLY (ECHO): Instead of looping through all clients, 
        // we just use the EXACT SAME 'socket' that sent the message!
        socket.send(`Server privately replies: I heard you say "${textMessage}"`);

    });

    // 4. Handle when the client closes their browser tab
    socket.on('close', () => {
        console.log("Client disconnected.");
        // Find the client in our array and remove them
        const index = clients.indexOf(socket);
        if (index > -1) {
            clients.splice(index, 1);
        }
    });
});
