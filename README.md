# Brojgar Worker - Job Marketplace Platform

A complete job marketplace web application connecting small businesses with local workers, built with React, Node.js, Express, and MongoDB.

## Features

### For Workers
- Register with skills and location
- Browse jobs in their area
- Pay ₹20 to unlock full job details and contact information
- View job history and earnings

### For Businesses  
- Post jobs for free
- Boost job posts for ₹100 (30 days priority visibility)
- Manage applications and worker responses
- Dashboard with analytics and insights

## Tech Stack

**Frontend:**
- React 18 with TypeScript
- Vite for fast development and building
- Tailwind CSS for styling
- shadcn/ui components
- React Query for state management
- Wouter for routing

**Backend:**
- Node.js with Express
- TypeScript throughout
- MongoDB with Mongoose ODM
- In-memory storage for development
- RESTful API design

**Production Ready:**
- Docker containerization
- PM2 process management
- Nginx reverse proxy
- SSL certificate automation
- Security middleware (Helmet, CORS, compression)

## Quick Start

### Development Setup

1. **Clone and install:**
```bash
git clone <your-repo>
cd brojgar-worker
npm install
```

2. **Start development server:**
```bash
npm run dev
```

3. **Access the application:**
- Open http://localhost:5000
- Try registering as a worker or business
- Test the job posting and unlocking features

### Production Deployment on AWS EC2

See the complete guide in `deploy/README.md`

**Quick deployment:**
1. Launch Ubuntu EC2 instance
2. Run the automated setup script
3. Configure MongoDB Atlas connection
4. Deploy and start the application

## Project Structure

```
brojgar-worker/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Route components
│   │   ├── hooks/         # Custom React hooks
│   │   └── lib/           # Utilities and config
├── server/                # Node.js backend
│   ├── models/            # MongoDB schemas
│   ├── routes.ts          # API endpoints
│   ├── storage.ts         # In-memory storage
│   ├── storage-mongodb.ts # MongoDB implementation
│   └── storage-factory.ts # Storage switching logic
├── shared/                # Shared TypeScript types
├── deploy/                # Deployment scripts and docs
└── dist/                  # Built application (after build)
```

## Environment Configuration

Copy `.env.example` to `.env` and configure:

```env
NODE_ENV=production
USE_MONGODB=true
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/brojgar-worker
PORT=5000
HOST=0.0.0.0
JWT_SECRET=your-super-secret-jwt-key
ALLOWED_ORIGINS=https://yourdomain.com
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server (with MongoDB)
- `npm run start:local` - Start production server (in-memory storage)

## Key Features Implementation

### Payment System
- Wallet-based payments for job unlocks
- Job boost payments for priority listing
- Secure transaction handling

### Job Matching
- Location-based job filtering
- Skills-based job recommendations
- Boosted jobs appear first in listings

### User Management
- Separate registration flows for workers and businesses
- Profile management and statistics
- Authentication and session handling

## Database Design

The application uses a flexible storage system:
- **Development**: Fast in-memory storage
- **Production**: MongoDB with proper schemas and indexes

### Data Models
- Users (workers and businesses)
- Jobs with boost and active status
- Payments and wallet transactions
- Job applications and unlocks

## Security Features

- CORS protection
- Helmet security headers
- Input validation with Zod
- Environment-based configuration
- Rate limiting ready

## Scaling Considerations

- Horizontal scaling with load balancers
- MongoDB Atlas auto-scaling
- CDN integration for static assets
- Caching layer support

## Support

For deployment issues, check:
1. Server logs: `pm2 logs brojgar-worker`
2. MongoDB connection in environment variables
3. Port and firewall configurations
4. SSL certificate setup

## License

MIT License - feel free to modify and use for your projects.

---

**Ready to deploy on AWS EC2 with MongoDB Atlas!**