# Overview

This is a local job marketplace platform called "Brojgar Worker" that connects small businesses with local workers. The application allows businesses to post jobs and workers to find job opportunities in their area. The platform includes features like job posting, worker profiles, skill matching, job boosting for businesses, and a payment system for unlocking job details.

## Recent Updates (Aug 2025)
- Added MongoDB integration for production deployment on AWS
- Created comprehensive AWS EC2 deployment scripts and documentation  
- Implemented production-ready server configuration with security middleware
- Added Docker support and PM2 process management
- Configured automatic storage switching (in-memory for dev, MongoDB for production)

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **React + TypeScript** with Vite as the build tool for fast development
- **Component-based architecture** using functional components and hooks
- **Routing** implemented with Wouter for lightweight client-side navigation
- **UI Framework** built with shadcn/ui components and Radix UI primitives
- **Styling** using Tailwind CSS with custom design tokens and Inter font
- **State Management** through React Query (@tanstack/react-query) for server state
- **Form Handling** with React Hook Form and Zod for validation

## Backend Architecture
- **Node.js with Express** server providing RESTful API endpoints
- **Monorepo structure** with shared schema and types between client and server
- **In-memory storage** implementation for development (IStorage interface allows easy database swapping)
- **Route organization** separating authentication, user management, job management, and payment handling
- **Middleware** for request logging and JSON parsing

## Data Storage Architecture
- **Flexible storage system** with factory pattern for environment-specific databases
- **Development**: In-memory storage (MemStorage) for fast iteration and testing
- **Production**: MongoDB integration with Mongoose ODM for scalable cloud deployment
- **Schema consistency** maintained through shared TypeScript interfaces (IStorage)
- **AWS-ready**: Configured for MongoDB Atlas with automatic connection management

## Key Data Models
- **Users** - Core user accounts with email authentication and wallet system
- **Workers** - Extended profiles with skills, experience levels, and ratings
- **Businesses** - Company profiles with business type and name
- **Jobs** - Job postings with location, skills, duration, and boost capabilities
- **Payments** - Transaction tracking for job unlocks and boosts
- **Applications** - Worker applications to jobs

## Authentication & Authorization
- **Simple email/password authentication** stored in user table
- **Role-based access** distinguishing between 'worker' and 'business' user types
- **Session management** through Express sessions with PostgreSQL storage
- **Protected routes** based on user authentication status

## Business Logic Features
- **Skill-based job matching** - Workers see jobs matching their skills and location
- **Job boosting system** - Businesses can pay to promote their job listings
- **Job unlocking mechanism** - Workers pay to access full job contact details
- **Wallet system** - Internal credits for payments and transactions
- **Rating system** - Worker performance tracking through completed jobs

## Development Tools & Configuration
- **TypeScript** for type safety across the entire stack
- **ESM modules** throughout the application
- **Path aliases** configured for clean imports (@/, @shared/)
- **Development server** with hot module replacement via Vite
- **Replit integration** with development banner and error overlay
- **Code quality** through strict TypeScript configuration

# External Dependencies

## Database & ORM
- **MongoDB Atlas** - Cloud MongoDB hosting for production
- **Mongoose** - MongoDB object modeling for Node.js with schema validation
- **In-Memory Storage** - Custom implementation for development environment

## UI & Design
- **Radix UI** - Headless component primitives for accessibility
- **shadcn/ui** - Pre-built component library
- **Tailwind CSS** - Utility-first styling framework
- **Lucide React** - Icon library

## State & Forms
- **TanStack React Query** - Server state management and caching
- **React Hook Form** - Form state management
- **Zod** - Runtime type validation and schema definition

## Development & Deployment
- **Vite** - Frontend build tool and development server  
- **TypeScript** - Static type checking
- **Replit** - Development environment with runtime error handling
- **Docker** - Container support for consistent deployments
- **PM2** - Process management for production Node.js applications
- **Nginx** - Reverse proxy and static file serving
- **Security Middleware** - Helmet, CORS, compression for production

## Utilities
- **date-fns** - Date manipulation and formatting
- **class-variance-authority** - Utility for conditional CSS classes
- **clsx & tailwind-merge** - CSS class name utilities