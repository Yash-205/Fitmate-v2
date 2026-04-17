# AI Fitness Coach Memory System

To build a professional AI personal trainer capable of a Continuous Feedback Loop (Step 10 in your provided context), the agent cannot be stateless. It needs to remember exactly what you've done, how you felt, and what plan you're currently executing.

Here is my approach to implementing **Short-Term** and **Long-Term Memory** in LangGraph using MongoDB, exactly as you requested.

## 1. Short-Term Memory (The Checkpointer)

**Purpose**: To remember the "immediate context" or a specific session/conversation thread. If you tell the agent "I'm having a bad day, tweak my workout", it remembers that for the duration of the back-and-forth conversation.

**Implementation**: 
- We will integrate LangGraph's `MongoDBSaver` checkpointer into `workoutAgent.ts`. 
- Every time the workflow is invoked, we pass your `thread_id`. The checkpointer seamlessly records the dialogue, graph steps, and immediate states into MongoDB.

## 2. Long-Term Memory (The Store)

**Purpose**: To remember you across *multiple* different threads and sessions over the months. This handles the "Macrocycle" thinking. If in Thread 1 you hit a new PR on Bench Press, Thread 2 (three weeks later) needs to know that and adjust your plan progression.

**Implementation**:
- LangGraph recently introduced the `BaseStore` abstraction which is essentially a cross-thread key-value/semantic memory system (this is what `InMemoryStore` extends).
- Since an official JS `MongoDBStore` wrapper is not bundled yet by default, **I will implement a custom `MongoDBStore`** class in your codebase.
- It will mimic the exact behavior of `InMemoryStore` (with `.get()`, `.put()`, and `.search()` methods), but it will read/write into a dedicated MongoDB collection (e.g., `langgraph_store`).

## 3. Applying It to the "10-Step Workflow"

Once both memory systems are attached to the `StateGraph.compile({ checkpointer, store })`:
1. **The Assessment Node**: Retrieves data from the **Long-Term Store** (overall profile, past injuries, macrocycle goal).
2. **The Generation Node**: Uses the **Short-Term Memory** to know if you requested a last-minute adjustment today due to bad sleep.
3. **The Adjustment Node**: After a workout, the agent receives feedback, writes the new completion logic to the Mongoose `WorkoutPlan` DB, and updates your overarching progression rule back into the **Long-Term Store**.

## Proposed Changes

### AI Memory Layer

#### [NEW] `src/ai/memory/MongoDBStore.ts`
Implement a `MongoDBStore` wrapper for Langgraph `BaseStore`. It will provide cross-thread persistence for saving details like persistent user preferences and progression metrics over months.

#### [MODIFY] `src/ai/workoutAgent.ts`
- Alter the agent structure from a one-shot function to a stateful LangGraph agent.
- Attach the `MongoDBSaver` (checkpointer).
- Attach the Custom `MongoDBStore` (store).
- Update the nodes to actively query the `store` to contextualize the prompt with historical data.

### ❓ Open Questions for You

1. **Memory Separation**: Do you want the LangGraph `MongoDBStore` to manage all long-term memory internally, or would you prefer the agent nodes to just use your existing Mongoose `Profile` and `WorkoutPlan` schemas as its implicit "long-term memory"? 
*(Typically using Mongoose schemas directly inside the nodes is easier for your traditional frontend React app to query later. Using `BaseStore` is more autonomous to the AI).*

2. **Refactoring Agent**: Do you want `workoutAgent.ts` just to be updated with memory, or should we merge this advanced generation into the general conversational `agent.ts`?
