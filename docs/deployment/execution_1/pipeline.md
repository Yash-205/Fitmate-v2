# Chronological Deployment Roadmap for Fitmate (MERN Single-Server)

To avoid any confusion, we will deploy the application in **seven clear, linear phases**. Complete one phase before moving to the next.

In this setup, your EC2 server will do **two jobs**:

1. Serve the **React/Vite Frontend** statically.
2. Run the **Express Backend** in a Docker container (and Nginx will route `/api` traffic to it).

---

```
[ Phase 1: Local Code + Dockerfile ] ──► [ Phase 2: Build & Test Locally ] ──► [ Phase 3: EC2 Launch ]
                                                                                         │
                                                                                         ▼
[ Phase 6: Deploy to Server ] ◄── [ Phase 5: Configure Nginx (Front & Back) ] ◄── [ Phase 4: Install Software ]
             │
             ▼
[ Phase 7: Automate (GitHub Actions) ]
```

---

## Phase 1: Prepare Your Codebase (Local)

We need to add two files to the root of your `backend` directory so that it can run inside Docker. (These have already been created for you).

### 1. `Dockerfile` (Backend only)

File: `backend/Dockerfile`

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY tsconfig.json ./

COPY src/ ./src/

RUN npm run build

EXPOSE 8000

CMD ["node", "dist/server.js"]
```

### 2. `.dockerignore`

File: `backend/.dockerignore`

```
node_modules

dist

.env
```

---

## Phase 2: Build and Test Docker Locally

Before touching AWS, let's make sure the backend Docker container works on your own machine.
Make sure you have Docker Desktop installed and running.

1. Open your terminal and navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Build the Docker image (this packages your code into a container):
   ```bash
   docker build -t fitmate-local-test .
   ```
3. Run the container locally to test it (passing your local `.env` variables):
   ```bash
   docker run -p 8000:8000 --env-file .env fitmate-local-test
   ```
4. Open your browser and go to `http://localhost:8000/health`. If it says "ok", your container works perfectly! You can stop the container (Ctrl+C).

*Now, commit the Dockerfile and .dockerignore to your Git repository and push them to GitHub.*

---

## Phase 3: Create the AWS Server

Now we leave the code alone and go to the AWS Console to rent our server.

1. Go to AWS Console → **EC2** → **Launch Instance**.
2. Set these values:
   - **Name**: `fitmate-production`
   - **OS**: `Ubuntu Server 24.04 LTS`
   - **Instance Type**: `t3.small` (cheap and has enough memory for builds)
   - **Key Pair**: Create one named `fitmate-key` (download the `.pem` file and store it safely on your computer)
   - **Security Group**: Open these ports to **Anywhere (0.0.0.0/0)**:
     - `HTTP` (Port 80)
     - `SSH` (Port 22)
3. Click **Launch**.
4. Once running, copy your server's **Public IP address** (e.g., `54.210.12.34`).

---

## Phase 4: Install Docker and Nginx on the Server

Now we connect to our fresh server and install the core software. Nginx will live directly on the server (not inside Docker) and will handle both your frontend and backend.

1. Open your terminal on your laptop and SSH into your server:
   ```bash
   ssh -i /path/to/fitmate-key.pem ubuntu@YOUR_SERVER_IP
   ```
2. Once connected inside the server terminal, run these commands to install Docker and Nginx:
   ```bash
   sudo apt-get update -y

   sudo apt-get install -y docker.io nginx

   sudo usermod -aG docker ubuntu
   ```
3. Type `exit` to disconnect, then SSH back in. This activates the Docker permissions.

---

## Phase 5: Configure Nginx to Route Frontend & Backend

Nginx will do two things: Serve your Vite `dist` folder on the main URL, and proxy any requests starting with `/api` to your Docker backend.

1. Inside your server terminal, open the Nginx default config:
   ```bash
   sudo nano /etc/nginx/sites-available/default
   ```
2. Delete everything inside and paste this:

```nginx
   server {

       listen 80;
   
       server_name _;

       # 1. Serve the Frontend (React/Vite)
   
       root /home/ubuntu/fitmate/code/frontend/dist;
   
       index index.html;

       location / {
   
           try_files $uri $uri/ /index.html;
       }

       # 2. Proxy the Backend (Express API via Docker)
   
       location /api/ {
   
           proxy_pass http://127.0.0.1:8000;
       
           proxy_http_version 1.1;
       
           proxy_set_header Host $host;
       
           proxy_set_header X-Real-IP $remote_addr;
       
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;

           # Critical settings for streaming AI answers without timeouts
       
           proxy_read_timeout 300s;
       
           proxy_send_timeout 300s;
       
           proxy_buffering off;
       }
   
   }
```

3. Save and exit (Ctrl+O, Enter, Ctrl+X).
4. Restart Nginx:
   ```bash
   sudo systemctl restart nginx
   ```

---

## Phase 6: Deploy the Container & Frontend to the Server

Let's put your code on the server and start it up.

1. Inside your server, create the app directory and a `.env` file:
   ```bash
   mkdir -p ~/fitmate

   nano ~/fitmate/.env
   ```
2. Paste your production environment variables (MongoDB URL, Gemini key, etc.):
   ```env
   PORT=8000

   MONGO_URI=mongodb+srv://...

   JWT_SECRET=your_secret_key

   GEMINI_API_KEY=your_gemini_api_key
   ```

   Save and exit.
3. Clone your GitHub repository onto the server:
   ```bash
   git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git ~/fitmate/code
   ```
4. Build the Frontend (Vite):
   ```bash
   cd ~/fitmate/code/frontend

   npm install

   npm run build
   ```
5. Build and run the Backend Docker container:
   ```bash
   cd ~/fitmate/code/backend

   docker build -t fitmate-backend .

   docker run -d \

     --name fitmate-app \
     
     -p 8000:8000 \
     
     --env-file ~/fitmate/.env \
     
     fitmate-backend
   ```
6. Open your web browser on your laptop and visit: `http://YOUR_SERVER_IP/`. You should see your frontend! If you visit `http://YOUR_SERVER_IP/api/health`, you should see your backend!

---

## Phase 7: Automate with GitHub Actions

We automate both the Frontend build and the Backend Docker restart when you push to `main`.

### 1. Add Secrets to GitHub

In your GitHub Repository → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**:

- Name: `SSH_PRIVATE_KEY` → Paste the contents of your `fitmate-key.pem` file.
- Name: `SERVER_IP` → Paste your EC2 public IP.

### 2. Create the Workflow File

On your laptop, create the file `.github/workflows/deploy.yml` in your repository:

```yaml
name: Deploy Fullstack to EC2

on:

  push:
  
    branches: [main]

jobs:

  deploy:
  
    runs-on: ubuntu-latest
  
    steps:
  
      - name: SSH and Deploy
      
        uses: appleboy/ssh-action@v1.0.3
      
        with:
      
          host: ${{ secrets.SERVER_IP }}
        
          username: ubuntu
        
          key: ${{ secrets.SSH_PRIVATE_KEY }}
        
          script: |
          
            cd ~/fitmate/code
          
            git pull origin main
          
            # 1. Rebuild Frontend
          
            cd frontend
          
            npm install
          
            npm run build
          
            # 2. Rebuild Backend Docker image
          
            cd ../backend
          
            docker build -t fitmate-backend .
          
            # 3. Stop and clean up old container
          
            docker stop fitmate-app || true
          
            docker rm fitmate-app || true
          
            # 4. Run new backend container
          
            docker run -d \
          
              --name fitmate-app \
          
              --restart unless-stopped \
          
              -p 8000:8000 \
          
              --env-file ~/fit.env \
          
              fitmate-backend
```
