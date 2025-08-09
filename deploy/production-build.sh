#!/bin/bash

# Production Build Script for Brojgar Worker
echo "🏗️  Building Brojgar Worker for production..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the application
echo "🔨 Building application..."
npm run build

# Create production directory structure
echo "📁 Creating production structure..."
mkdir -p dist/client
mkdir -p logs

# Copy necessary files
echo "📋 Copying production files..."
cp -r dist/* ./
cp ecosystem.config.js ./
cp .env.example ./

# Set permissions
echo "🔒 Setting permissions..."
chmod +x dist/index.js
chmod -R 755 logs

echo "✅ Production build complete!"
echo ""
echo "🚀 To deploy on AWS EC2:"
echo "1. Upload all files to your EC2 instance"
echo "2. Copy .env.example to .env and configure with your MongoDB URI"
echo "3. Run: USE_MONGODB=true node dist/index.js"
echo "4. Or use PM2: pm2 start ecosystem.config.js"