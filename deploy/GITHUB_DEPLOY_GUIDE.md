# GitHub to AWS EC2 Deployment Guide

This guide shows you how to deploy your Brojgar Worker app from GitHub to AWS EC2.

## Repository Structure

Your clean GitHub repository contains only the essential files:

```
brojgar-worker/
├── client/                 # React frontend application
├── server/                 # Express backend with MongoDB
├── shared/                 # Shared TypeScript types
├── deploy/                 # Deployment scripts and guides
├── package.json            # Dependencies and scripts
├── .env.example           # Environment template
├── .gitignore             # Git ignore rules
├── ecosystem.config.js     # PM2 configuration
├── Dockerfile             # Container configuration
└── README.md              # Project documentation
```

## Step 1: Push to GitHub

1. **Initialize Git repository:**
```bash
git init
git add .
git commit -m "Initial commit: Brojgar Worker job marketplace"
```

2. **Create GitHub repository** and push:
```bash
git remote add origin https://github.com/yourusername/brojgar-worker.git
git push -u origin main
```

## Step 2: Deploy on AWS EC2

### Option A: Clone and Deploy (Recommended)

1. **SSH into your EC2 instance:**
```bash
ssh -i your-key.pem ubuntu@your-ec2-ip
```

2. **Clone your repository:**
```bash
git clone https://github.com/yourusername/brojgar-worker.git
cd brojgar-worker
```

3. **Run automated setup:**
```bash
chmod +x deploy/aws-ec2-setup.sh
./deploy/aws-ec2-setup.sh
```

4. **Configure environment:**
```bash
cp .env.example .env
nano .env
# Add your MongoDB connection string
```

5. **Install and build:**
```bash
npm install
npm run build
```

6. **Start with PM2:**
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### Option B: GitHub Actions CI/CD (Advanced)

Create `.github/workflows/deploy.yml` for automatic deployment:

```yaml
name: Deploy to AWS EC2

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    
    - name: Deploy to EC2
      uses: appleboy/ssh-action@v0.1.5
      with:
        host: ${{ secrets.EC2_HOST }}
        username: ubuntu
        key: ${{ secrets.EC2_SSH_KEY }}
        script: |
          cd /var/www/brojgar-worker
          git pull origin main
          npm install
          npm run build
          pm2 restart brojgar-worker
```

## Step 3: Environment Setup

Your `.env` file should contain:

```env
NODE_ENV=production
USE_MONGODB=true
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/brojgar-worker
PORT=5000
HOST=0.0.0.0
JWT_SECRET=your-super-secret-jwt-key
ALLOWED_ORIGINS=https://yourdomain.com
```

## Step 4: Verify Deployment

1. **Check application status:**
```bash
pm2 list
pm2 logs brojgar-worker
```

2. **Test the application:**
- Visit your domain or EC2 IP
- Test worker registration
- Test business registration
- Test job posting and unlocking

## Repository Management

### Development Workflow

1. **Make changes locally**
2. **Test thoroughly**
3. **Commit and push to GitHub**
4. **Deploy to EC2** (manual or automated)

### File Management

**Included in repository:**
- Source code (client, server, shared)
- Configuration files (package.json, tsconfig.json, etc.)
- Deployment scripts and documentation
- Environment template (.env.example)

**Excluded from repository:**
- node_modules/ (dependencies)
- dist/ (build output)
- .env (environment secrets)
- logs/ (runtime logs)
- .replit (development-only files)

## Security Best Practices

1. **Never commit secrets** - Use .env files
2. **Use strong passwords** for MongoDB and JWT
3. **Enable HTTPS** with SSL certificates
4. **Update dependencies** regularly
5. **Monitor access logs** and unusual activity

## Troubleshooting

### Common Issues:

1. **Build fails**: Check Node.js version (needs 18+)
2. **Database connection**: Verify MONGODB_URI and IP whitelist
3. **PM2 not starting**: Check port 5000 availability
4. **Git permission denied**: Check SSH keys or use HTTPS

### Getting Help:

- Check deployment logs: `pm2 logs`
- Review MongoDB connection in Atlas
- Verify environment variables in .env
- Check server resources: `htop`

---

Your Brojgar Worker app is now ready for professional deployment from GitHub to AWS EC2!