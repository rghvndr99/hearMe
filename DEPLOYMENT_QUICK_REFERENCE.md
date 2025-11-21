# VoiceLap Deployment Quick Reference

---

## 🚀 Quick Deploy

```bash
# Push to main branch - automatic deployment
git push origin main
```

---

## 📦 Docker Commands

```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f

# Restart a service
docker-compose restart backend

# Rebuild and restart
docker-compose build && docker-compose up -d

# Check status
docker-compose ps
```

---

## 🔐 Required GitHub Secrets

### Server Access
- `DEPLOY_KEY` - SSH private key
- `DEPLOY_HOST` - Server IP/hostname
- `DEPLOY_USER` - SSH username

### Application
- `DOMAIN` - voicelap.com
- `MONGO_URI` - MongoDB Atlas URI
- `JWT_SECRET` - 48+ character secret
- `VITE_API_URL` - https://voicelap.com/api

### API Keys
- `OPENAI_API_KEY`
- `ELEVENLABS_API_KEY`
- `DEEPGRAM_API_KEY`
- `RESEND_API_KEY`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`

---

## 🏗️ Project Structure

```
voicelap/
├── docker-compose.yml          # Multi-container orchestration
├── .env.production.example     # Environment template
├── backend/
│   ├── Dockerfile             # Backend container
│   └── src/
├── frontend/
│   ├── Dockerfile             # Frontend build
│   └── src/
├── nginx/
│   ├── Dockerfile             # Nginx proxy
│   └── conf.d/
│       └── site.conf          # Nginx config
└── .github/
    └── workflows/
        └── deploy.yml         # CI/CD pipeline
```

---

## 🔧 Server Setup (One-time)

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo apt-get install docker-compose-plugin

# Create app directory
mkdir -p ~/app

# Add user to docker group
sudo usermod -aG docker $USER
newgrp docker
```

---

## 🔑 SSH Setup (One-time)

```bash
# Generate SSH key
ssh-keygen -t ed25519 -f ~/.ssh/voicelap_deploy

# Copy to server
ssh-copy-id -i ~/.ssh/voicelap_deploy.pub user@server

# Add private key to GitHub
cat ~/.ssh/voicelap_deploy
# Copy output → GitHub → Settings → Secrets → DEPLOY_KEY
```

---

## 🧪 Testing

```bash
# Test locally
docker-compose up

# Test production
curl https://voicelap.com
curl https://voicelap.com/api/health

# Check logs
docker-compose logs -f backend
```

---

## 🆘 Troubleshooting

```bash
# Container won't start
docker-compose logs backend

# Restart everything
docker-compose down && docker-compose up -d

# Check resources
docker stats
df -h

# Clean up
docker system prune -f
```

---

## 📊 Monitoring

```bash
# Container status
docker-compose ps

# Resource usage
docker stats

# Logs (live)
docker-compose logs -f

# Logs (specific service)
docker-compose logs -f nginx
```

---

## 🔄 Common Tasks

### Update Application
```bash
git push origin main  # Automatic via GitHub Actions
```

### Manual Update
```bash
ssh user@server
cd ~/app
git pull
docker-compose build
docker-compose up -d
```

### Rollback
```bash
ssh user@server
cd ~/app
git checkout <commit-hash>
docker-compose build
docker-compose up -d
```

### View Environment
```bash
docker-compose exec backend env
```

### Database Connection Test
```bash
docker-compose exec backend node scripts/test_mongo_connection.js
```

---

## 🔐 Security Checklist

- [ ] Firewall configured (ports 80, 443, 22 only)
- [ ] SSH key authentication (no passwords)
- [ ] Strong JWT secret (48+ chars)
- [ ] MongoDB Atlas IP whitelist configured
- [ ] SSL certificate installed
- [ ] Environment variables secured
- [ ] Regular backups enabled

---

## 📞 Support

- **Documentation**: See `DOCKER_DEPLOYMENT_GUIDE.md`
- **GitHub Actions**: Repository → Actions tab
- **Logs**: `docker-compose logs -f`

---

**Quick Reference v1.0** | VoiceLap Production Deployment

