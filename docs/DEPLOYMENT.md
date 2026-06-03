# Deployment Guide - AI Intake Assistant

## Overview

This guide covers deploying the AI Intake Assistant to production.

## Frontend Deployment (Vercel)

### Prerequisites
- Vercel account
- GitHub repository

### Steps

1. **Connect Repository**
   - Go to vercel.com
   - Click "New Project"
   - Select your GitHub repository
   - Select "Next.js" framework

2. **Configure Environment Variables**
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   NEXT_PUBLIC_API_URL=https://api.yourdomain.com
   ```

3. **Deploy**
   - Vercel automatically deploys on push to main
   - Custom domain: Settings → Domains

### Performance Optimization
- Image optimization enabled by default
- Static generation for public pages
- ISR (Incremental Static Regeneration) for dashboard

## Backend Deployment (VPS)

### Prerequisites
- VPS (Hetzner recommended)
- Python 3.11+
- Ollama instance
- Domain name

### Setup Steps

1. **SSH into VPS**
   ```bash
   ssh root@your-vps-ip
   ```

2. **Install Dependencies**
   ```bash
   apt update && apt upgrade -y
   apt install -y python3.11 python3.11-venv python3-pip nginx certbot python3-certbot-nginx
   ```

3. **Clone Repository**
   ```bash
   cd /opt
   git clone https://github.com/yourusername/intake-ai-assistant.git
   cd intake-ai-assistant/backend
   ```

4. **Create Virtual Environment**
   ```bash
   python3.11 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```

5. **Create .env File**
   ```bash
   cp .env.example .env
   # Edit .env with production values
   nano .env
   ```

6. **Create Systemd Service**
   ```bash
   sudo nano /etc/systemd/system/intake-api.service
   ```

   ```ini
   [Unit]
   Description=AI Intake Assistant API
   After=network.target

   [Service]
   Type=notify
   User=www-data
   WorkingDirectory=/opt/intake-ai-assistant/backend
   Environment="PATH=/opt/intake-ai-assistant/backend/venv/bin"
   ExecStart=/opt/intake-ai-assistant/backend/venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8000
   Restart=always
   RestartSec=10

   [Install]
   WantedBy=multi-user.target
   ```

7. **Enable Service**
   ```bash
   sudo systemctl daemon-reload
   sudo systemctl enable intake-api
   sudo systemctl start intake-api
   ```

8. **Configure Nginx**
   ```bash
   sudo nano /etc/nginx/sites-available/intake-api
   ```

   ```nginx
   upstream intake_api {
       server 127.0.0.1:8000;
   }

   server {
       listen 80;
       server_name api.yourdomain.com;

       location / {
           proxy_pass http://intake_api;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
   }
   ```

9. **Enable Nginx Site**
   ```bash
   sudo ln -s /etc/nginx/sites-available/intake-api /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

10. **Setup SSL Certificate**
    ```bash
    sudo certbot --nginx -d api.yourdomain.com
    ```

### Ollama Deployment

**Option 1: Same VPS**
```bash
# Install Ollama
curl https://ollama.ai/install.sh | sh

# Pull model
ollama pull mistral

# Create systemd service
sudo nano /etc/systemd/system/ollama.service
```

```ini
[Unit]
Description=Ollama
After=network.target

[Service]
Type=simple
User=ollama
ExecStart=/usr/bin/ollama serve
Restart=always

[Install]
WantedBy=multi-user.target
```

**Option 2: Separate GPU Machine**
- Deploy Ollama on GPU-enabled machine
- Update `OLLAMA_BASE_URL` in backend .env
- Ensure network connectivity between backend and Ollama

## Database Setup (Supabase)

1. **Create Project**
   - Go to supabase.com
   - Create new project
   - Note the URL and API keys

2. **Run Migrations**
   - Copy SQL from `docs/DATABASE_SCHEMA.md`
   - Paste into Supabase SQL Editor
   - Execute

3. **Create Storage Buckets**
   - Storage → New Bucket
   - Create `intake-documents` (private)
   - Create `intake-exports` (private)

4. **Configure RLS Policies**
   - Already included in migration SQL

## Monitoring & Logging

### Backend Logs
```bash
# View service logs
sudo journalctl -u intake-api -f

# View Nginx logs
sudo tail -f /var/log/nginx/error.log
```

### Health Checks
```bash
# Check API health
curl https://api.yourdomain.com/health

# Check Ollama health
curl http://localhost:11434/api/tags
```

### Monitoring Tools (Optional)
- Sentry for error tracking
- DataDog for performance monitoring
- Prometheus for metrics

## Backup & Recovery

### Database Backups
```bash
# Supabase handles automatic backups
# Manual backup:
pg_dump postgresql://user:password@db.supabase.co/postgres > backup.sql

# Restore:
psql postgresql://user:password@db.supabase.co/postgres < backup.sql
```

### File Backups
```bash
# Backup Supabase Storage
# Use Supabase CLI or manual export
```

## Security Checklist

- [ ] SSL/TLS certificates installed
- [ ] Firewall configured (only allow necessary ports)
- [ ] SSH key-based authentication enabled
- [ ] Fail2ban installed for brute-force protection
- [ ] Regular security updates scheduled
- [ ] Database backups automated
- [ ] Environment variables secured
- [ ] API rate limiting enabled
- [ ] CORS properly configured
- [ ] Secrets not in code or logs

## Performance Tuning

### Backend
- Increase worker processes: `--workers 4`
- Enable caching for intake flow
- Use connection pooling for database

### Database
- Enable query caching
- Create indexes on frequently queried columns
- Monitor slow queries

### Frontend
- Enable static generation
- Use image optimization
- Implement lazy loading

## Scaling Considerations

### Phase 1 (MVP - 100-1000 users)
- Single backend instance
- Managed Supabase database
- Local Ollama

### Phase 2 (1000-10000 users)
- Load balancer
- Multiple backend instances
- Database read replicas
- Redis caching layer

### Phase 3 (10000+ users)
- Kubernetes orchestration
- Ollama API service
- CDN for static assets
- Message queue (Celery)

## Troubleshooting

### API not responding
```bash
# Check service status
sudo systemctl status intake-api

# Restart service
sudo systemctl restart intake-api

# Check logs
sudo journalctl -u intake-api -n 50
```

### Ollama connection errors
```bash
# Check Ollama is running
curl http://localhost:11434/api/tags

# Restart Ollama
sudo systemctl restart ollama
```

### Database connection errors
- Verify SUPABASE_URL and SUPABASE_KEY
- Check network connectivity
- Verify RLS policies

### File upload failures
- Check storage bucket permissions
- Verify file size limits
- Check disk space

## Maintenance

### Regular Tasks
- Monitor logs daily
- Check disk space weekly
- Review security updates weekly
- Backup database daily
- Test disaster recovery monthly

### Updates
```bash
# Update dependencies
pip install --upgrade -r requirements.txt

# Update system
sudo apt update && sudo apt upgrade -y

# Restart services
sudo systemctl restart intake-api
```

---

**Support:** For issues, check logs and error messages. Refer to FastAPI, Supabase, and Ollama documentation.
