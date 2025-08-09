#!/bin/bash

# AWS EC2 Setup Script for Brojgar Worker App
# Run this script on your EC2 instance

echo "🚀 Setting up Brojgar Worker on AWS EC2..."

# Update system packages
echo "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Node.js 20
echo "📦 Installing Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 globally
echo "📦 Installing PM2..."
sudo npm install -g pm2

# Install Nginx
echo "📦 Installing Nginx..."
sudo apt install -y nginx

# Install certbot for SSL certificates
echo "📦 Installing Certbot..."
sudo apt install -y certbot python3-certbot-nginx

# Create application directory
echo "📁 Creating application directory..."
sudo mkdir -p /var/www/brojgar-worker
sudo chown -R $USER:$USER /var/www/brojgar-worker
cd /var/www/brojgar-worker

# Clone or copy your application files here
echo "📂 Please upload your application files to /var/www/brojgar-worker"

# Create logs directory
mkdir -p logs

# Set up environment variables
echo "⚙️  Setting up environment variables..."
cat > .env << EOF
NODE_ENV=production
USE_MONGODB=true
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/brojgar-worker
PORT=5000
HOST=0.0.0.0
JWT_SECRET=$(openssl rand -base64 32)
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
EOF

echo "⚙️  Please edit .env file with your actual MongoDB connection string and domain"

# Configure Nginx
echo "🌐 Configuring Nginx..."
sudo tee /etc/nginx/sites-available/brojgar-worker << EOF
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 86400;
    }

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript application/json;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
}
EOF

# Enable the site
sudo ln -sf /etc/nginx/sites-available/brojgar-worker /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test nginx configuration
sudo nginx -t

# Configure firewall
echo "🔒 Configuring firewall..."
sudo ufw enable
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'

# Create systemd service for auto-start
echo "🔧 Creating systemd service..."
sudo tee /etc/systemd/system/brojgar-worker.service << EOF
[Unit]
Description=Brojgar Worker App
After=network.target

[Service]
Type=forking
User=$USER
WorkingDirectory=/var/www/brojgar-worker
ExecStart=/usr/bin/pm2 start ecosystem.config.js --no-daemon
ExecReload=/usr/bin/pm2 reload all
ExecStop=/usr/bin/pm2 kill
Restart=always

[Install]
WantedBy=multi-user.target
EOF

echo "✅ Setup complete! Next steps:"
echo "1. Upload your application files to /var/www/brojgar-worker"
echo "2. Edit .env file with your MongoDB connection string"
echo "3. Run: npm install"
echo "4. Run: npm run build"
echo "5. Update server_name in /etc/nginx/sites-available/brojgar-worker"
echo "6. Run: sudo systemctl reload nginx"
echo "7. Run: sudo systemctl enable brojgar-worker"
echo "8. Run: sudo systemctl start brojgar-worker"
echo "9. For SSL: sudo certbot --nginx -d your-domain.com -d www.your-domain.com"

echo "🎉 Your Brojgar Worker app will be ready at your domain!"