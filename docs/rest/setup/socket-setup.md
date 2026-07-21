# Socket.io Setup Guide & Verification

## Backend Setup Progress

- [X] **Step 1: Install Dependencies** (`socket.io` installed in backend).
- [X] **Step 2: The Database Model** (`backend/src/models/DirectMessage.ts` created).
- [X] **Step 3: The Socket.io Manager** (`backend/src/socket.ts` created).
- [X] **Step 4: Attach it to Server** (`backend/src/server.ts` updated).

## Frontend Setup Progress

- [X] **Step 5: The Frontend Socket Service** (`frontend/src/services/socket.ts` created).
- [X] **Step 6: The Chat UI Component**
- [ ] **Step 7: Render the Component**

### Step 1: Install Dependencies

```bash
# In your backend folder
cd backend
npm install socket.io

# In your frontend folder
cd ../frontend
npm install socket.io-client
```

### Step 2: The Database Model

**File:** `backend/src/models/DirectMessage.ts`

```typescript
import mongoose, { Schema, Document } from "mongoose";

export interface IDirectMessage extends Document {
  senderId: mongoose.Types.ObjectId;
  receiverId: mongoose.Types.ObjectId;
  message: string;
  read: boolean;
  createdAt: Date;
}

const DirectMessageSchema: Schema = new Schema(
  {
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    receiverId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    message: { type: String, required: true },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model<IDirectMessage>("DirectMessage", DirectMessageSchema);
```

### Step 3: The Socket.io Manager

**File:** `backend/src/socket.ts`

```typescript
import { Server as SocketIOServer, Socket } from "socket.io";
import { Server as HttpServer } from "http";
import DirectMessage from "./models/DirectMessage";

export const initializeSocket = (httpServer: HttpServer) => {
    const io = new SocketIOServer(httpServer, {
        cors: {
            origin: "*", 
            methods: ["GET", "POST"]
        }
    });

    console.log("Socket.io initialized.");

    io.on("connection", (socket: Socket) => {
        console.log(`New client connected: ${socket.id}`);

        // User Identification
        socket.on("register", (userId: string) => {
            socket.join(userId); 
            console.log(`User ${userId} joined their personal room.`);
        });

        // Private Messaging
        socket.on("send_message", async (data: { senderId: string; receiverId: string; message: string }) => {
            const { senderId, receiverId, message } = data;

            const newMessage = await DirectMessage.create({
                senderId,
                receiverId,
                message
            });

            // Send to Receiver
            io.to(receiverId).emit("receive_message", newMessage);
      
            // Send back to Sender
            socket.emit("receive_message", newMessage);
        });

        socket.on("disconnect", () => {
            console.log(`Client disconnected: ${socket.id}`);
        });
    });

    return io;
};
```

### Step 4: Attach it to your Server

**File:** `backend/src/server.ts`

```typescript
import dotenv from "dotenv";
dotenv.config();
import connectDB from "./config/db";
import app from "./app";
import { initializeSocket } from "./socket"; 

connectDB();

const PORT = process.env.PORT || 8000;

const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

initializeSocket(server);

process.on("unhandledRejection", (err: any) => {
    console.error("Unhandled Rejection:", err.message);
});

process.on("uncaughtException", (err: any) => {
    console.error("Uncaught Exception:", err.message);
});
```

---

## Frontend Setup

### Step 5: The Frontend Socket Service

Because React components re-render constantly, we don't want the browser to connect and disconnect from the WebSocket server every time a user types a letter. We need a "Singleton" service that connects exactly once.

Create a new file at `frontend/src/services/socket.ts`.

**File:** `frontend/src/services/socket.ts`

```typescript
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
```

---

### Step 6: The Chat UI Component

Create a new file at `frontend/src/components/chat/ChatBox.tsx`. This component will listen for new messages and send messages via the Socket service we just created.

**File:** `frontend/src/components/chat/ChatBox.tsx`

```tsx
import React, { useEffect, useState } from "react";
import { getSocket } from "../../services/socket";

interface Message {
  senderId: string;
  receiverId: string;
  message: string;
}

export const ChatBox = ({ currentUserId, targetUserId }: { currentUserId: string, targetUserId: string }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState("");

    useEffect(() => {
        const socket = getSocket();

        // Listen for incoming messages
        socket.on("receive_message", (newMessage: Message) => {
            // Only add if the message belongs to this conversation
            if (
                (newMessage.senderId === targetUserId && newMessage.receiverId === currentUserId) ||
                (newMessage.senderId === currentUserId && newMessage.receiverId === targetUserId)
            ) {
                setMessages((prev) => [...prev, newMessage]);
            }
        });

        // Cleanup listener when component unmounts
        return () => {
            socket.off("receive_message");
        };
    }, [currentUserId, targetUserId]);

    const sendMessage = () => {
        if (!inputValue.trim()) return;

        const socket = getSocket();
        socket.emit("send_message", {
            senderId: currentUserId,
            receiverId: targetUserId,
            message: inputValue
        });

        setInputValue("");
    };

    return (
        <div className="flex flex-col h-96 w-80 border rounded bg-white shadow">
            <div className="p-3 bg-gray-100 border-b font-semibold">
                Chat with User {targetUserId.substring(0,4)}...
            </div>
          
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`p-2 rounded max-w-[80%] ${msg.senderId === currentUserId ? 'bg-blue-500 text-white self-end ml-auto' : 'bg-gray-200 text-black mr-auto'}`}>
                        {msg.message}
                    </div>
                ))}
            </div>

            <div className="p-3 border-t flex gap-2">
                <input 
                    type="text" 
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                    className="flex-1 border rounded px-2 py-1 outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Type a message..."
                />
                <button onClick={sendMessage} className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition">
                    Send
                </button>
            </div>
        </div>
    );
};
```

---


### Step 7: Integrate Chat into the Trainers Page

You're right, testing on a fake page is boring. Let's put the Chat Box exactly where it belongs: on the Trainer Discovery page so you can actually message your coach!


**1. Open frontend/src/pages/Trainers.tsx**

At the very top, add the imports for your new chat system:

```tsx
import { ChatBox } from '../components/chat/ChatBox';
import { registerUserForChat } from '../services/socket';
```


**2. Add State for the Chat and User**
Inside the `Trainers` component (around line 23), add two new state variables to hold the current User's ID and to track if the chat window is open:

```tsx
const [currentUserId, setCurrentUserId] = useState<string | null>(null);
const [showChatFor, setShowChatFor] = useState<string | null>(null);
```

**3. Capture the User ID and Register the Socket**
In the `fetchData` function inside the `useEffect` (around line 43), right after you set the `currentTrainerId`, grab the user's ID and register them to the socket server:

```tsx
        if (profileData?.trainerId) {
          setCurrentTrainerId(profileData.trainerId);
        }
        if (profileData?.userId) {
          setCurrentUserId(profileData.userId);
          // Register to the socket server immediately so they can receive private messages!
          registerUserForChat(profileData.userId); 
        }
```

**4. Update the CTA Button to Open Chat**
Scroll down to the `<button>` that says "Connect to Trainer" (around line 171). We need to change the `onClick` logic so that if the trainer is ALREADY their coach, clicking the button opens the chat!

Change the `onClick` and `disabled` props to look like this:

```tsx
              <button 
                onClick={() => {
                    // IF THEY ARE ALREADY CONNECTED: Toggle the Chat Window
                    if (currentTrainerId === trainer._id) {
                        setShowChatFor(showChatFor === trainer._id ? null : trainer._id);
                    } else {
                        // OTHERWISE: Connect them
                        handleConnect(trainer._id);
                    }
                }}
                disabled={currentTrainerId !== trainer._id && !!connectingId}
                // ... keep your existing className ...
              >
                {/* Inside the button, change "My Coach" to "Message Coach" */}
                {connectingId === trainer._id ? (
                   <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : currentTrainerId === trainer._id ? (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    {showChatFor === trainer._id ? "Close Chat" : "Message Coach"}
                  </>
                ) : (
                  "Connect to Trainer"
                )}
              </button>
```

**5. Render the Chat Box!**
Right *below* that `<button>`, add this condition to render the `ChatBox` component when toggled:

```tsx
              {showChatFor === trainer._id && currentUserId && (
                  <div className="absolute z-50 bg-white shadow-2xl rounded-lg border border-slate-200 mt-2 left-0 right-0">
                      <ChatBox currentUserId={currentUserId} targetUserId={trainer._id} />
                  </div>
              )}
```

*(Tip: Make sure to add `relative` to the className string of the parent trainer card div (line 122) so the absolute chat box floats nicely exactly over the card!).*
