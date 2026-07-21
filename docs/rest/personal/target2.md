### Summary

This video by Mayank presents a detailed **60-day roadmap** designed to help candidates **master system design** and excel in system design interviews. The roadmap is structured to provide a comprehensive foundation of system design concepts, technologies, and real-world architectures, enabling learners to confidently approach system design problems. The approach emphasizes understanding core principles, optimizing client-server connections, scalability, reliability, and security rather than memorizing specific architectures. Mayank also stresses that there is no absolute “right” or “wrong” answer in system design interviews, but rather the focus is on how well one can optimize and justify design decisions.

---

### Key Insights

- **System Design Focus:** Optimizing client-server connections for reliability, scalability, security, low latency, and negligible downtime.
- **No absolute right or wrong answers:** Interviews assess your design thinking, trade-offs, and problem-solving approach.
- **Learning architectures by analogy:** Knowing one architecture well (e.g., Uber for ride-sharing, Instagram Reels for short videos) enables designing similar systems.
- **Microservices are not always the solution:** Monolithic architecture can be suitable for smaller user bases.
- **Importance of foundational knowledge:** Understanding data structures, networking, OS concepts, and databases is critical before diving into system design.
- **Progressive learning:** Month one is foundational (optional for those with prior knowledge), month two covers core system design concepts, and month three focuses on practicing real-world architectures and revision.

---

### 60-Day Roadmap Overview

| Month              | Focus Area                       | Topics Covered                                                           | Notes                                                 |
| ------------------ | -------------------------------- | ------------------------------------------------------------------------ | ----------------------------------------------------- |
| Month 1            | Foundational Concepts (Optional) | Data Structures, Networking, OS Concepts, Database Basics                | Skip if already comfortable; revision can be quick    |
| Month 2            | Core System Design Concepts      | Scaling, Load Balancers, Caching, Database Deep Dive, Queues & Messaging | Core system design learning; essential for interviews |
| Month 3 (Optional) | Practice & Revision              | Design Thinking, Design Patterns, Real-World Architectures, Revision     | Deep practice recommended; flexible duration          |

---

### Detailed Breakdown

#### Month 1: Foundational Knowledge (Optional)

- **Data Structures:** Essential from a system design perspective.

  - Hash Maps, Stacks, Queues, Priority Queues, B-Trees, Tries.
  - Important for databases and system internals.
- **Networking Concepts:**

  - Protocol differences: HTTP vs HTTPS, TCP vs UDP.
  - Use cases: UDP for live streaming; TCP for YouTube video streaming.
  - DNS resolution, TCP three-way handshake.
  - REST APIs and correct usage of HTTP status codes (e.g., 200 vs 404).
  - Differentiation between latency, throughput, and bandwidth.
- **Operating System Concepts:**

  - Threads vs Processes: understanding resource sharing.
  - CPU scheduling and context switching.
  - Blocking I/O vs Asynchronous I/O.
  - Virtual memory, paging, file systems, and storage basics.
- **Databases:**

  - Differences between relational (SQL) and NoSQL databases.
  - SQL joins and queries review.
  - Understanding when and why to use SQL vs NoSQL.

*Note:* This month is mainly for those new to these concepts or unfamiliar with them, especially if not preparing for coding interviews in parallel.

---

#### Month 2: Core System Design Concepts

- **Week 1: Scaling and Load Balancing**

  - Vertical vs Horizontal Scaling.
  - Types of Load Balancers: Layer 4, Layer 7, DNS-based.
  - Health checks and failover mechanisms.
  - Consistent hashing technique for distributed systems.
- **Week 2: Caching**

  - Importance of caching in system design.
  - Differences between Redis and Memcached.
  - Cache eviction policies: LRU (Least Recently Used), LFU (Least Frequently Used), FIFO (First In First Out).
  - Cache writing strategies: Write-through and Write-back.
- **Week 3: Database Deep Dive**

  - Sharding and partitioning for large-scale systems.
  - Database replication models.
  - Read replicas vs write replicas: one write database, multiple read replicas.
  - Handling database failover scenarios.
  - CAP Theorem: trade-offs between Consistency, Availability, and Partition tolerance.
  - Eventual consistency vs strong consistency.
    - Eventual consistency: acceptable in social media stats (e.g., view counts).
    - Strong consistency: critical in financial systems.
- **Week 4: Queues and Messaging Systems**

  - Message brokers: Kafka and RabbitMQ.
  - Communication models: synchronous vs asynchronous.
  - Publisher-subscriber (pub-sub) model explained.
  - Delivery guarantees, message ordering.
  - Dead letter queues and retry mechanisms for failed message processing.

*Additional Resources:* Mayank references several in-depth videos and playlists that cover these topics comprehensively, encouraging viewers to utilize these for accelerated learning.

---

#### Month 3: Practice, Design Thinking, and Revision

- **Week 9: Design Thinking**

  - Requirement clarification: user scale, geographic distribution, and architecture choice.
  - Bottleneck identification in system components.
  - Data flow and control flow: direct service interaction vs event-driven.
  - Stateful vs stateless design decisions.
  - Failure handling strategies.
- **Week 10: Design Patterns**

  - Rate limiting (token bucket, leaky bucket, sliding window).
  - Circuit breaker pattern and retry logic.
  - Leader election: critical for failover scenarios in distributed databases.
  - Health checks and heartbeat mechanisms.
  - CQRS (Command Query Responsibility Segregation) and event sourcing.
- **Week 11: Real-World Architectures**

  - Focus on **six popular architectures** that serve as blueprints for many others:
    - Instagram Reels (short video platforms).
    - Uber (ride-sharing platforms).
    - Twitter feed (feed-based platforms like Facebook, LinkedIn).
    - YouTube-like video platforms.
    - E-commerce backends (Amazon, Flipkart).
    - URL shortener (recommended for freshers).
  - Learning one architecture helps in designing others of the same type with minor variations.
  - Avoid attempting to learn every architecture, focus on mastering a few representative designs.
- **Week 12: Revision and Deep Dive**

  - Revise all design concepts and patterns.
  - Summarize common bottlenecks and solutions.
  - Create notes on confusing topics or weak areas.
  - Optionally, study additional architectures based on interview needs.
  - Recommended to spend extra time practicing more architectures if time permits.

---

### Important Concepts and Definitions

| Term                       | Definition / Explanation                                                                                    |
| -------------------------- | ----------------------------------------------------------------------------------------------------------- |
| Vertical Scaling           | Increasing resources (CPU, RAM) on a single server.                                                         |
| Horizontal Scaling         | Adding more servers to distribute load.                                                                     |
| Load Balancer              | Distributes incoming network traffic across multiple servers.                                               |
| Consistent Hashing         | A hashing technique to distribute load evenly and handle node failures gracefully.                          |
| Caching                    | Storing frequently accessed data closer to the client to reduce latency.                                    |
| Cache Eviction Policies    | Strategies to remove stale cache entries: LRU, LFU, FIFO.                                                   |
| Write-through Cache        | Data is written to cache and backing store simultaneously.                                                  |
| Write-back Cache           | Data is written to cache first and later persisted to backing store.                                        |
| Sharding                   | Partitioning data across multiple databases to scale horizontally.                                          |
| Replication                | Copying data across multiple databases for redundancy and read scalability.                                 |
| CAP Theorem                | A system can provide only two of the three guarantees: Consistency, Availability, Partition tolerance.      |
| Eventual Consistency       | Data changes propagate asynchronously; data will converge eventually.                                       |
| Strong Consistency         | All reads reflect the most recent write; critical in financial applications.                                |
| Message Broker             | Middleware that enables asynchronous communication via message queues (Kafka, RabbitMQ).                    |
| Publisher-Subscriber Model | Communication pattern where publishers send messages to topics and subscribers receive them asynchronously. |
| Dead Letter Queue          | Special queue for holding undelivered or failed messages for further analysis.                              |
| Rate Limiting              | Controls the number of requests a client can make to prevent abuse.                                         |
| Circuit Breaker            | Pattern to stop repeated failed calls to a service to allow recovery.                                       |
| Leader Election            | Process to select a coordinator node in distributed systems for fault tolerance.                            |
| CQRS                       | Separates read and write operations for scalability and performance.                                        |
| Event Sourcing             | Stores changes as a sequence of events rather than just current state.                                      |

---

### Additional Notes and Recommendations

- **Design interviews emphasize requirement clarification** before jumping into designing—understanding user scale, expected traffic, and system constraints is vital.
- **Microservices architecture should be used judiciously**—it's not a universal solution and may add unnecessary complexity if the user base is small.
- Mayank provides **linked videos and playlists** covering foundational and advanced system design topics, updated for current industry standards (2026).
- The roadmap is flexible, allowing learners to spend more time on practicing real-world architectures if desired.
- Candidates are encouraged to **make concise notes and summaries** during the revision phase to strengthen understanding and recall.
- The video encourages **active engagement** via comments and subscriptions for further queries and updates.

---

### Conclusion

This structured 60-day system design roadmap lays out a clear path from foundational concepts through core principles to practical architecture design and revision. It is designed to build strong conceptual clarity, problem-solving skills, and architectural intuition needed to crack system design interviews effectively. The focus on analogy-based learning of architectures and emphasis on design thinking prepares candidates to tackle a wide variety of system design problems with confidence and clarity.
