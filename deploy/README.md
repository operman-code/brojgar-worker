# Brojgar Worker - AWS Deployment Guide

This guide will help you deploy your Brojgar Worker app on AWS EC2 with MongoDB Atlas.

## Prerequisites

1. **AWS Account** with EC2 access
2. **MongoDB Atlas** cluster set up
3. **Domain name** (optional but recommended)

## Step 1: Set Up MongoDB Atlas

1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Create a new cluster (free tier works fine for testing)
3. Create a database user with read/write permissions
4. Whitelist your EC2 IP address (or use 0.0.0.0/0 for testing)
5. Get your connection string

## Step 2: Launch EC2 Instance

1. **Instance Type**: `t3.micro` (free tier) or `t3.small` for production
2. **AMI**: Ubuntu 22.04 LTS
3. **Security Group**: Allow ports 22 (SSH), 80 (HTTP), 443 (HTTPS)
4. **Storage**: 20GB should be sufficient

## Step 3: Deploy Your Application

### Option A: Automated Setup (Recommended)

1. SSH into your EC2 instance:
```bash
ssh -i your-key.pem ubuntu@your-ec2-ip
```

2. Download and run the setup script:
```bash
curl -fsSL https://raw.githubusercontent.com/your-repo/deploy/aws-ec2-setup.sh | bash
```

3. Upload your application files to `/var/www/brojgar-worker`

4. Configure your environment:
```bash
cd /var/www/brojgar-worker
nano .env
```

Update with your MongoDB connection string:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/brojgar-worker
```

5. Install dependencies and build:
```bash
npm install
npm run build
```

6. Start the application:
```bash
sudo systemctl enable brojgar-worker
sudo systemctl start brojgar-worker
```

### Option B: Manual Setup

1. **Install Node.js 20:**
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

2. **Install PM2:**
```bash
sudo npm install -g pm2
```

3. **Upload your app files** to `/var/www/brojgar-worker`

4. **Install dependencies:**
```bash
cd /var/www/brojgar-worker
npm install
```

5. **Configure environment:**
```bash
cp .env.example .env
nano .env
```

6. **Build the application:**
```bash
npm run build
```

7. **Start with PM2:**
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## Step 4: Configure Nginx (Optional)

For better performance and SSL support:

1. **Install Nginx:**
```bash
sudo apt install nginx
```

2. **Configure reverse proxy:**
```bash
sudo nano /etc/nginx/sites-available/brojgar-worker
```

3. **Enable the site:**
```bash
sudo ln -s /etc/nginx/sites-available/brojgar-worker /etc/nginx/sites-enabled/
sudo systemctl reload nginx
```

## Step 5: Set Up SSL (Recommended)

1. **Install Certbot:**
```bash
sudo apt install certbot python3-certbot-nginx
```

2. **Get SSL certificate:**
```bash
sudo certbot --nginx -d your-domain.com
```

## Environment Variables

Make sure to set these in your `.env` file:

```env
NODE_ENV=production
USE_MONGODB=true
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/brojgar-worker
PORT=5000
HOST=0.0.0.0
JWT_SECRET=your-super-secret-jwt-key
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

## Monitoring and Logs

- **View PM2 processes:** `pm2 list`
- **View logs:** `pm2 logs brojgar-worker`
- **Restart app:** `pm2 restart brojgar-worker`
- **Monitor resources:** `pm2 monit`

## Security Best Practices

1. **Firewall:** Enable UFW and allow only necessary ports
2. **Updates:** Keep your system updated
3. **Backups:** Set up automated MongoDB backups
4. **Monitoring:** Use CloudWatch or similar for monitoring
5. **SSL:** Always use HTTPS in production

## Scaling Options

- **Horizontal scaling:** Use Application Load Balancer with multiple EC2 instances
- **Database scaling:** MongoDB Atlas auto-scaling
- **CDN:** Use CloudFront for static assets
- **Caching:** Implement Redis for session storage and caching

## Troubleshooting

1. **App not starting:** Check `pm2 logs brojgar-worker`
2. **Database connection issues:** Verify MongoDB URI and IP whitelist
3. **Port issues:** Ensure port 5000 is not blocked
4. **Memory issues:** Upgrade to a larger instance type

## Support

For issues specific to the Brojgar Worker app, check the application logs and ensure all environment variables are properly configured.