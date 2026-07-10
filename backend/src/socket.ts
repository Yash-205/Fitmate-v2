import { Server as SocketIOServer, Socket } from "socket.io";
import { Server as HttpServer } from "http";
import DirectMessage from "./models/DirectMessage";

export const initializeSocket = (httpServer: HttpServer) => {
    // 1. Initialize Socket.io and attach it to our Express server
    const io = new SocketIOServer(httpServer, {
        cors: {
            origin: "*", // In production, restrict this to your frontend URL
            methods: ["GET", "POST"]
        }
    });

    console.log("Socket.io initialized.");

    // 2. Listen for new connections
    io.on("connection", (socket: Socket) => {
        console.log(`New client connected: ${socket.id}`);

        // 3. User Identification
        // When a user logs in, the frontend will emit a "register" event with their User ID
        socket.on("register", (userId: string) => {
            socket.join(userId); // Put the user in a room named after their ID
            console.log(`User ${userId} joined their personal room.`);
        });

        // 4. Private Messaging
        socket.on("send_message", async (data: { senderId: string; receiverId: string; message: string }) => {
            const { senderId, receiverId, message } = data;

            // Save to MongoDB first
            const newMessage = await DirectMessage.create({
                senderId,
                receiverId,
                message
            });

            // Send the message directly to the Receiver's private room
            io.to(receiverId).emit("receive_message", newMessage);
            
            // Also send it back to the Sender so their screen updates instantly
            socket.emit("receive_message", newMessage);
        });

        socket.on("disconnect", () => {
            console.log(`Client disconnected: ${socket.id}`);
        });
    });

    return io;
};
