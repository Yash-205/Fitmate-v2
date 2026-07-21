# The Modern Full-Stack & DevOps Learning Roadmap

Since you already know full-stack development up to REST APIs, this roadmap bridges the gap. It is specifically tailored to make you a highly competitive developer who specializes in **Real-Time Communication** and **DevOps/Cloud Deployments**.

---

## Phase 1: Real-Time Communication (Beyond REST)
*REST is great, but it requires the client to "ask" for data. Modern apps push data to the client instantly.*

- [ ] **WebSockets (The Foundation)**
  - Learn how the WebSocket protocol keeps a persistent, two-way connection open.
  - Build a raw WebSocket server using Node.js (`ws` library).
- [ ] **Socket.io (The Industry Standard)**
  - Learn Socket.io, which wraps WebSockets and adds features like broadcasting, "rooms", and automatic reconnects.
  - *Project: Build a real-time group chat application.*
- [ ] **Server-Sent Events (SSE)**
  - Learn SSE for one-way, real-time data (Server pushing to Client). Great for live news feeds or AI streaming (like ChatGPT's typing effect).
- [ ] **WebRTC (Peer-to-Peer)**
  - Learn how to stream video, audio, or raw data directly between two browsers without going through a central server.
  - *Project: Build a 1-on-1 video calling app.*

## Phase 2: Scaling Real-Time Apps (Message Brokers)
*If you have 10,000 users chatting, one server will crash. You need multiple servers. But how do users on Server A chat with users on Server B?*

- [ ] **Redis In-Memory Database**
  - Learn caching and fast key-value storage.
- [ ] **Redis Pub/Sub**
  - Learn the Publish/Subscribe pattern. Server A publishes a message, Server B is subscribed and receives it instantly.
  - *Project: Scale your chat app across two servers using the Socket.io Redis Adapter.*
- [ ] **Message Queues (Kafka / RabbitMQ)**
  - Learn how heavy, enterprise-level systems handle millions of real-time events without losing data.

---

## Phase 3: Local DevOps & Containerization
*Now that you have a complex app with Node.js, Redis, and WebSockets, you need to package it.*

- [ ] **Linux Command Line Basics**
  - Learn to navigate Ubuntu: `cd`, `ls`, `grep`, `chmod`, `chown`, `ssh`, and process management (`htop`, `kill`).
- [ ] **Docker Fundamentals**
  - Learn the difference between Images and Containers.
  - Write a `Dockerfile` for your real-time Node.js backend.
- [ ] **Docker Compose**
  - Learn how to run your Node.js container and a Redis container simultaneously using a single `docker-compose.yml` file.

---

## Phase 4: Web Servers & Security
*Before putting your app on the internet, you need a bouncer at the door.*

- [ ] **Nginx Basics**
  - Learn how to configure Nginx to serve static React files.
- [ ] **Nginx as a Reverse Proxy & Load Balancer**
  - Learn how to route `/api` to your backend container.
  - **Crucial:** Learn how to configure Nginx to support WebSocket upgrading! (Standard Nginx settings break WebSockets).
- [ ] **SSL/TLS Certificates (HTTPS & WSS)**
  - Learn how to use Certbot / Let's Encrypt to get free SSL certificates. WebSockets require secure connections (`wss://`) in production!

---

## Phase 5: Cloud Infrastructure (Manual Deployment)
*Time to rent a server and deploy your app.*

- [ ] **AWS EC2 (Elastic Compute Cloud)**
  - Rent a free-tier Ubuntu server on AWS.
  - SSH into your server from your terminal.
- [ ] **Security Groups & Networking**
  - Learn how to open ports (80 for HTTP, 443 for HTTPS, 22 for SSH) on AWS.
- [ ] **Manual Deployment**
  - Install Docker and Nginx on your EC2 server.
  - Clone your code, run `docker compose up`, and access your real-time app from a public IP address!

---

## Phase 6: Automation (CI/CD)
*Never deploy manually again.*

- [ ] **GitHub Actions (Recommended over Jenkins for Modern Devs)**
  - Write a YAML workflow file.
  - Configure it to run your unit tests every time you push code.
- [ ] **Continuous Deployment (CD)**
  - Automate the process: When you merge to `main`, GitHub Actions automatically connects to your AWS EC2 server, pulls the new code, and restarts your Docker containers.

---

### How to use this roadmap:
Don't try to learn it all at once! The best way is to build **one single project** (like a Real-Time Collaborative Whiteboard or Chat App) and push it through every single phase of this roadmap until it is deployed automatically on AWS.
