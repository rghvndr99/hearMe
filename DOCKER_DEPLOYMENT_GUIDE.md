# VoiceLap Docker Deployment Guide

Complete guide for deploying VoiceLap to production using Docker and GitHub Actions.

---

## 📋 Overview

This deployment setup uses:
- **Docker Compose** - Multi-container orchestration
- **GitHub Actions** - Automated CI/CD pipeline
- **Nginx** - Reverse proxy and static file serving
- **MongoDB Atlas** - Cloud database
- **Let's Encrypt** - SSL certificates (optional)

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────┐
│           GitHub Actions                │
│  (Build, Test, Deploy on push to main) │
└──────────────┬──────────────────────────┘
               │ SSH + Rsync
               ▼
┌─────────────────────────────────────────┐
│           VPS Server                    │
│  ┌───────────────────────────────────┐  │
│  │     Docker Compose                │  │
│  │  ┌─────────┐  ┌─────────┐        │  │
│  │  │ Nginx   │  │ Backend │        │  │
│  │  │  :80    │──│  :5001  │        │  │
│  │  │  :443   │  └─────────┘        │  │
│  │  └─────────┘                      │  │
│  │       │                           │  │
│  │       └──> Frontend (static)      │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│        MongoDB Atlas (Cloud)            │
└─────────────────────────────────────────┘
```

---

## 📦 Files Created

### Docker Configuration
- ✅ `docker-compose.yml` - Multi-container orchestration
- ✅ `backend/Dockerfile` - Backend container image
- ✅ `frontend/Dockerfile` - Frontend build container
- ✅ `nginx/Dockerfile` - Nginx reverse proxy
- ✅ `nginx/conf.d/site.conf` - Nginx configuration

### Deployment Configuration
- ✅ `.github/workflows/deploy.yml` - CI/CD pipeline
- ✅ `.env.production.example` - Environment template

---

## 🚀 Quick Start

### 1. Configure GitHub Secrets

Go to your repository → Settings → Secrets and variables → Actions

Add these secrets:

**Server Access:**
- `DEPLOY_KEY` - SSH private key
- `DEPLOY_HOST` - Server IP or hostname
- `DEPLOY_USER` - SSH username

**Application:**
- `DOMAIN` - voicelap.com
- `MONGO_URI` - MongoDB Atlas connection string
- `JWT_SECRET` - JWT secret (48+ characters)
- `VITE_API_URL` - https://voicelap.com/api

**API Keys:**
- `OPENAI_API_KEY`
- `ELEVENLABS_API_KEY`
- `DEEPGRAM_API_KEY`
- `RESEND_API_KEY`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`

### 2. Prepare Your VPS Server

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo apt-get update
sudo apt-get install docker-compose-plugin

# Create app directory
mkdir -p ~/app

# Add your user to docker group
sudo usermod -aG docker $USER
newgrp docker
```

### 3. Setup SSH Access

```bash
# On your local machine, generate SSH key
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/voicelap_deploy

# Copy public key to server
ssh-copy-id -i ~/.ssh/voicelap_deploy.pub user@your-server

# Add private key to GitHub secrets
cat ~/.ssh/voicelap_deploy
# Copy the output and add as DEPLOY_KEY secret
```

### 4. Deploy

```bash
# Push to main branch
git add .
git commit -m "Setup Docker deployment"
git push origin main

# GitHub Actions will automatically:
# 1. Build frontend and backend
# 2. Sync code to server
# 3. Build Docker images
# 4. Deploy containers
```

---

## 🔧 Manual Deployment (Optional)

If you want to deploy manually without GitHub Actions:

```bash
# 1. SSH to your server
ssh user@your-server

# 2. Clone repository
cd ~/app
git clone https://github.com/rghvndr99/hearMe.git .

# 3. Create .env.production
cp .env.production.example .env.production
nano .env.production
# Fill in your actual values

# 4. Build and deploy
docker-compose build
docker-compose up -d

# 5. Check status
docker-compose ps
docker-compose logs -f
```

---

## 📊 Docker Commands

### View Running Containers
```bash
docker-compose ps
```

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f nginx
```

### Restart Services
```bash
# All services
docker-compose restart

# Specific service
docker-compose restart backend
```

### Stop Services
```bash
docker-compose down
```

### Rebuild and Restart
```bash
docker-compose build
docker-compose up -d
```

### Clean Up
```bash
# Remove stopped containers
docker-compose down

# Remove images
docker image prune -f

# Remove everything (careful!)
docker system prune -a
```

---

## 🔐 SSL/HTTPS Setup (Optional)

### Using Let's Encrypt with Certbot

```bash
# 1. Install certbot
sudo apt-get install certbot

# 2. Stop nginx temporarily
docker-compose stop nginx

# 3. Get certificate
sudo certbot certonly --standalone -d voicelap.com -d www.voicelap.com

# 4. Copy certificates
sudo cp -r /etc/letsencrypt nginx/certs/

# 5. Update nginx/conf.d/site.conf to add SSL
# (Add SSL server block)

# 6. Restart nginx
docker-compose up -d nginx
```

---

## 🧪 Testing

### Test Locally with Docker

```bash
# Build images
docker-compose build

# Start services
docker-compose up

# Test in browser
open http://localhost
```

### Test Production Deployment

```bash
# Check if services are running
curl http://voicelap.com

# Check API
curl http://voicelap.com/api/health

# Check logs
docker-compose logs -f
```

---

## 🆘 Troubleshooting

### Container Won't Start
```bash
# Check logs
docker-compose logs backend

# Check if port is in use
sudo lsof -i :5001

# Restart container
docker-compose restart backend
```

### Frontend Not Loading
```bash
# Check nginx logs
docker-compose logs nginx

# Verify frontend was built
docker-compose exec nginx ls /usr/share/nginx/html

# Rebuild frontend
docker-compose build frontend nginx
docker-compose up -d
```

### Database Connection Failed
```bash
# Check environment variables
docker-compose exec backend env | grep MONGO

# Test MongoDB connection
docker-compose exec backend node scripts/test_mongo_connection.js
```

### GitHub Actions Deployment Failed
```bash
# Check GitHub Actions logs
# Go to: Repository → Actions → Latest workflow run

# Common issues:
# 1. SSH key not added to server
# 2. Docker not installed on server
# 3. Missing GitHub secrets
# 4. Server out of disk space
```

---

## 📈 Monitoring

### Check Resource Usage
```bash
# Container stats
docker stats

# Disk usage
docker system df

# Server resources
htop
df -h
```

### Health Checks
```bash
# Backend health
curl http://localhost/api/health

# Check all containers
docker-compose ps
```

---

## 🔄 Updates and Rollbacks

### Update Application
```bash
# Just push to main branch
git push origin main

# Or manually on server
cd ~/app
git pull
docker-compose build
docker-compose up -d
```

### Rollback
```bash
# On server
cd ~/app
git log --oneline
git checkout <previous-commit-hash>
docker-compose build
docker-compose up -d
```

---

## ✅ Production Checklist

Before going live:

- [ ] All GitHub secrets configured
- [ ] SSH access to server working
- [ ] Docker installed on server
- [ ] Domain DNS pointing to server
- [ ] MongoDB Atlas connection tested
- [ ] All API keys obtained and working
- [ ] SSL certificate installed (optional)
- [ ] Firewall configured (ports 80, 443, 22)
- [ ] Backup strategy in place
- [ ] Monitoring setup
- [ ] Test deployment successful

---

**Your VoiceLap application is ready for production deployment!** 🚀

