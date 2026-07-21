# Real-Time Communication Implementation Plan

This document outlines our strategy for learning and implementing real-time chat in the Fitmate application. We will take a two-phased approach to ensure a deep understanding of the underlying technologies before relying on high-level abstractions.

## Phase 1: Raw WebSockets Side Application
**Goal:** Understand the fundamental mechanics of the WebSocket protocol without "magic" libraries.

* **What we will build:** A standalone, simple chat application outside of the main Fitmate backend.
* **Technology:** Node.js with the raw `ws` library.
* **Concepts to Master:**
  * The HTTP `Upgrade` handshake.
  * Manually keeping track of connected clients using an Array or Set.
  * Manually looping through clients to broadcast messages.
  * Handling dropped connections natively.
  * `JSON.stringify` and `JSON.parse` for data transmission.

## Phase 2: Fitmate Integration with Socket.io
**Goal:** Build a robust, production-ready chat service between Fitmate Learners and Trainers.

* **What we will build:** Integrating real-time messaging directly into our existing Express/TypeScript backend.
* **Technology:** `socket.io` on the backend, `socket.io-client` on the React frontend.
* **Concepts to Master:**
  * **Rooms:** Creating private channels (e.g., `room_trainer1_learner2`) so messages remain secure and private between specific users.
  * **Automatic Reconnection:** Relying on Socket.io's polling fallback and auto-reconnect features for mobile users.
  * **Authentication:** Validating the existing JWT tokens during the Socket.io handshake to ensure only authenticated Fitmate users can connect to the chat.
  * **Database Integration:** Saving chat histories to MongoDB using a new `DirectMessage` model before broadcasting them.
