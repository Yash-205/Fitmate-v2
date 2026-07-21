# VPC — What It Is and Why Fitmate Needs One

## What is a VPC?

VPC stands for **Virtual Private Cloud**. Ignore the fancy name. Here is what it actually is:

When you create a server on AWS, by default that server is just... sitting there on AWS's computers with nothing protecting it. Any hacker on the internet can try to connect to it directly. That's bad.

A VPC is your **own private section of the AWS network**. Think of it like this:
- AWS is a massive apartment building with thousands of units
- Your VPC is your **own locked apartment** inside that building
- You decide who can come in, who can talk to who, and what doors are open

Everything inside the VPC can talk to each other privately. Nothing from the outside internet can get in unless you explicitly allow it.

---

## Why Does Fitmate NEED a VPC?

Your app has two things that need to be treated very differently:

**1. The Load Balancer (ALB)** — This NEEDS to face the internet. Users hit this to reach your app.

**2. Your actual EC2 Server (where your Node.js app runs)** — This should be **hidden from the internet**. Only the load balancer should be able to talk to it.

Without a VPC, both of these would be sitting exposed on the internet. Anyone could try hitting your EC2 server directly and bypass any protections you have on the Load Balancer.

The VPC lets you put the Load Balancer in a **Public Subnet** (visible to internet) and your server in a **Private Subnet** (completely invisible to the internet). The server only receives traffic from the Load Balancer.

---

## What Are "Public" and "Private" Subnets?

A **Subnet** is just a smaller section inside your VPC. Think of rooms inside your apartment:
- **Public Subnet** = The living room. Guests (internet traffic) can reach it.
- **Private Subnet** = The bedroom. Totally locked from outsiders. Only things already inside the apartment can talk to it.

For Fitmate:
- Load Balancer → Public Subnet (needs to face the internet)
- EC2 Server → Private Subnet (only the Load Balancer can reach it)

---

## Why 2 of Each Subnet?

This is a valid question. AWS requires a Load Balancer to span at least **2 "Availability Zones"** (AZs). An Availability Zone is literally a separate physical data center building. If one building's power goes out, the other keeps running.

So you create:
- 2 public subnets (one in each AZ, for the Load Balancer to span both)
- 2 private subnets (one in each AZ, for redundancy if you ever scale)

You are NOT setting up two separate networks. It's **one VPC, one network** — just spread across two physical locations for safety. Your EC2 server will only live in ONE of those private subnets.

---

## What is a NAT Gateway and Why Does It Exist?

Here's a catch: your EC2 server is in a private subnet (no direct internet). But your server NEEDS to make outbound calls — to MongoDB Atlas, to Gemini API, to Mem0.

A **NAT Gateway** sits in the public subnet and acts like a middleman: your private EC2 can ask NAT Gateway to "hey, make this API call for me." NAT Gateway does it, and brings the response back. The outside world only ever sees the NAT Gateway, never your EC2 server.

It's like sending a trusted secretary out of the apartment to run errands rather than going outside yourself.

---

## Summary — The Full Picture

```
Internet
   ↓
[Route 53 - your domain fitmate.app]
   ↓
[ALB - Load Balancer] ← Lives in PUBLIC subnet
   ↓
[EC2 - Your Node.js App] ← Lives in PRIVATE subnet
   ↓ (outbound only, via NAT Gateway)
[MongoDB Atlas, Gemini, Mem0]
```

All of the above (except Route 53 and the external APIs) lives inside **one single VPC**. That VPC is the security boundary that keeps your server safe.
