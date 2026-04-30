# Implementation Plan - Chatbot Streaming Responses

Streaming makes the AI feel much faster and more responsive. This plan outlines the steps to implement token-by-token streaming from the backend (Groq/LangGraph) to the frontend (React).

## User Review Required

> [!IMPORTANT]
> - This will change the communication protocol for the chat from a single JSON response to a stream of Server-Sent Events (SSE). 
> - The `/api/chat` endpoint will now return a stream, so any external tools using this endpoint may need updates.

## Proposed Steps

### Step 1: Backend Graph Enhancement
Modify `backend/src/ai/graphs/chatGraph.ts` to export a new `streamAgent` function. This function will use LangGraph's `.streamEvents()` method to capture token-level output from the model.

### Step 2: Backend Controller Refactor
Update `backend/src/controllers/chatController.ts` to:
1. Set headers for SSE (`Content-Type: text/event-stream`).
2. Iterate through the stream from the graph.
3. Write each chunk to the response buffer using the `data: ...\n\n` format.
4. Finalize the stream once the AI is done.

### Step 3: Frontend API Update
Modify the chat submission logic in `frontend/src/pages/Chatbot.tsx` (or a helper service):
1. Use `fetch` to call the chat endpoint.
2. Get the `body.getReader()` to start reading the stream.
3. Use a `TextDecoder` to decode chunks.

### Step 4: Frontend UI State Sync
1. When a stream starts, add a placeholder "assistant" message to the state.
2. As tokens arrive, append them to that specific message's content using a functional state update (`setMessages(prev => ...)`).
3. Ensure the UI scrolls to the bottom as the content grows.

## Open Questions
- Should we stream only the final message content, or also metadata (like when it's searching memories)? 
  - *Recommendation*: Start with just message content for simplicity.

## Verification Plan
1. **Manual Test**: Type a long query and verify that words appear one-by-one rather than all at once.
2. **Performance Check**: Verify that the "First Word Latency" (TTFT) is significantly lower than before.
