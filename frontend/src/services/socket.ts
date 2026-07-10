import { io, Socket } from "socket.io-client";

// Update this to your deployed backend URL when going to production
const SOCKET_URL = "http://localhost:8001";

let socket: Socket | null = null;

export const getSocket = (): Socket => {
    if (!socket) {
        socket = io(SOCKET_URL, {
            autoConnect: true,
            // You can pass the JWT token here later for secure authentication!
        });

        socket.on("connect", () => {
            console.log("Connected to Socket.io server:", socket?.id);
        });

        socket.on("disconnect", () => {
            console.log("Disconnected from Socket.io server.");
        });
    }
    return socket;
};

// Helper function to register the user's ID with the server so they join their private room
export const registerUserForChat = (userId: string) => {
    const s = getSocket();
    s.emit("register", userId);
};
