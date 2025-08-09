# Brojgar Worker Deployment Checklist

Use this checklist to ensure a successful deployment on AWS EC2 with MongoDB Atlas.

## Pre-Deployment Setup

### ☐ MongoDB Atlas Setup
- [ ] Create MongoDB Atlas account
- [ ] Create new cluster (free tier M0 is fine for testing)
- [ ] Create database user with read/write permissions
- [ ] Get connection string
- [ ] Whitelist EC2 IP address (or 0.0.0.0/0 for testing)

### ☐ Domain Setup (Optional)
- [ ] Purchase domain name
- [ ] Configure DNS to point to EC2 IP
- [ ] Update ALLOWED_ORIGINS in environment

### ☐ AWS EC2 Setup  
- [ ] Launch Ubuntu 22.04 LTS instance
- [ ] Instance type: t3.micro (free tier) or t3.small+
- [ ] Security group: Allow ports 22, 80, 443
- [ ] Create and download SSH key pair
- [ ] Note down public IP address

## Deployment Process

### ☐ Server Setup
- [ ] SSH into EC2 instance
- [ ] Run automated setup script OR manual installation
- [ ] Create application directory: `/var/www/brojgar-worker`

### ☐ Application Deployment
- [ ] Upload application files to server
- [ ] Copy `.env.example` to `.env`
- [ ] Configure `.env` with MongoDB connection string
- [ ] Install dependencies: `npm install`
- [ ] Build application: `npm run build`

### ☐ Process Management
- [ ] Install and configure PM2
- [ ] Start application: `pm2 start ecosystem.config.js`
- [ ] Save PM2 configuration: `pm2 save && pm2 startup`
- [ ] Verify application is running: `pm2 list`

### ☐ Reverse Proxy (Nginx)
- [ ] Install Nginx
- [ ] Configure reverse proxy to port 5000
- [ ] Update server_name with your domain
- [ ] Test nginx configuration: `sudo nginx -t`
- [ ] Reload nginx: `sudo systemctl reload nginx`

### ☐ SSL Certificate (Let's Encrypt)
- [ ] Install Certbot
- [ ] Generate SSL certificate: `sudo certbot --nginx -d yourdomain.com`
- [ ] Verify certificate renewal: `sudo certbot renew --dry-run`

### ☐ Firewall Configuration
- [ ] Enable UFW: `sudo ufw enable`
- [ ] Allow SSH: `sudo ufw allow ssh`
- [ ] Allow Nginx: `sudo ufw allow 'Nginx Full'`

## Post-Deployment Testing

### ☐ Application Testing
- [ ] Access website via domain/IP
- [ ] Test worker registration
- [ ] Test business registration  
- [ ] Test job posting functionality
- [ ] Test job unlocking with payment
- [ ] Test job boosting feature
- [ ] Verify all pages load correctly
- [ ] Test responsive design on mobile

### ☐ Database Testing
- [ ] Verify MongoDB connection in logs
- [ ] Test data persistence (create user, refresh, data should remain)
- [ ] Check database collections in MongoDB Atlas

### ☐ Performance & Monitoring
- [ ] Check server resource usage: `htop`
- [ ] Monitor PM2 processes: `pm2 monit`
- [ ] Review application logs: `pm2 logs brojgar-worker`
- [ ] Test website speed and responsiveness

## Security Checklist

### ☐ Server Security
- [ ] Update system packages: `sudo apt update && sudo apt upgrade`
- [ ] Configure automatic security updates
- [ ] Disable root login via SSH
- [ ] Use strong SSH key authentication
- [ ] Change default SSH port (optional)

### ☐ Application Security
- [ ] Use strong JWT_SECRET (32+ random characters)
- [ ] Configure CORS for specific domains in production
- [ ] Enable HTTPS only (no HTTP)
- [ ] Validate all environment variables are set

### ☐ Database Security
- [ ] Use MongoDB Atlas (managed security)
- [ ] Strong database password
- [ ] IP whitelist configured properly
- [ ] Enable MongoDB audit logging (paid plans)

## Backup & Monitoring

### ☐ Backup Strategy
- [ ] Configure MongoDB Atlas automatic backups
- [ ] Set up regular application file backups
- [ ] Document recovery procedures

### ☐ Monitoring Setup
- [ ] Configure CloudWatch (AWS) or similar monitoring
- [ ] Set up alerts for high CPU/memory usage
- [ ] Monitor disk space usage
- [ ] Set up uptime monitoring

## Scaling Preparation

### ☐ Future Scaling
- [ ] Document current configuration
- [ ] Plan for load balancer setup
- [ ] Consider CDN for static assets
- [ ] Plan database scaling strategy

## Troubleshooting

### Common Issues:
- **App not starting**: Check `pm2 logs` for errors
- **Database connection**: Verify MONGODB_URI and IP whitelist
- **502 Bad Gateway**: Check if Node.js app is running on port 5000
- **SSL issues**: Verify domain DNS and certificate installation
- **Performance**: Monitor server resources and upgrade instance size

## Emergency Contacts

- [ ] Document server access credentials
- [ ] Note MongoDB Atlas login details  
- [ ] Record domain registrar information
- [ ] List key stakeholder contacts

---

**Once all items are checked, your Brojgar Worker app should be live and running smoothly on AWS!**