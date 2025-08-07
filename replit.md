# Overview

Winscreen is a real-time screen sharing application built with React and Express. The app enables users to either host screen sharing sessions or join existing sessions using room codes. It uses WebRTC for peer-to-peer communication and WebSockets for signaling, providing a seamless cross-device screen sharing experience.

The application is now configured as a Progressive Web App (PWA) with offline capabilities, installable on mobile devices, and ready for deployment on Replit's cloud platform.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React with TypeScript using Vite for development and building
- **UI Components**: shadcn/ui component library with Radix UI primitives for accessible, customizable components
- **Styling**: Tailwind CSS with CSS variables for theming support (light/dark modes)
- **State Management**: TanStack Query (React Query) for server state management and data fetching
- **Routing**: Wouter for lightweight client-side routing
- **Real-time Communication**: Custom WebRTC and WebSocket hooks for screen sharing functionality

## Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Real-time**: WebSocket server for signaling between peers
- **Session Storage**: In-memory storage implementation with interface for potential database upgrades

## Data Storage
- **Database**: PostgreSQL (configured but using in-memory storage currently)
- **Schema**: Two main entities - rooms and participants with foreign key relationships
- **Connection**: Neon Database serverless driver for PostgreSQL connectivity
- **Migrations**: Drizzle Kit for database schema management

## Authentication & Session Management
- **Room Access**: 6-character alphanumeric room codes for session identification
- **Device Identification**: Unique device IDs generated per session
- **Role Management**: Host and viewer roles with different permissions
- **Connection Tracking**: WebSocket connection status monitoring

## WebRTC Implementation
- **Signaling**: Custom WebSocket-based signaling server for peer negotiation
- **Screen Capture**: Browser's getDisplayMedia API with configurable quality settings
- **STUN Servers**: Google's public STUN servers for NAT traversal
- **Connection Management**: ICE candidate exchange and connection state monitoring

## Key Design Decisions

### Modular Component Architecture
The frontend uses a component-based architecture with separate interfaces for hosting and viewing, enabling different user experiences based on role while maintaining code reusability.

### Type-Safe Development
TypeScript is used throughout the stack with shared schema definitions between client and server, ensuring data consistency and reducing runtime errors.

### Scalable Storage Pattern
The storage layer uses an interface pattern allowing easy transition from in-memory storage to database persistence without changing business logic.

### Progressive Enhancement
The WebRTC implementation includes fallbacks and error handling for various browser capabilities and network conditions.

# External Dependencies

## Frontend Dependencies
- **shadcn/ui & Radix UI**: Comprehensive UI component library for consistent, accessible interface elements
- **TanStack Query**: Server state management and caching for efficient data fetching
- **Wouter**: Lightweight routing library for single-page application navigation
- **Tailwind CSS**: Utility-first CSS framework for responsive design and theming

## Backend Dependencies
- **Drizzle ORM**: Type-safe SQL query builder and schema management
- **Neon Database**: Serverless PostgreSQL database service
- **WebSocket (ws)**: Real-time bidirectional communication for signaling

## Development Tools
- **Vite**: Fast development server and build tool with React support
- **esbuild**: High-performance bundler for production server code
- **TypeScript**: Static type checking and enhanced developer experience
- **PostCSS & Autoprefixer**: CSS processing and vendor prefix handling

## WebRTC Infrastructure
- **Google STUN Servers**: Public STUN servers for NAT traversal and connectivity
- **Browser WebRTC APIs**: Native browser support for peer-to-peer communication and screen capture

# Deployment & Publishing

## Progressive Web App (PWA) Features
- **Service Worker**: Offline caching and background sync capabilities
- **Web App Manifest**: Installable on mobile devices with native app-like experience
- **App Icons**: Custom branding with 192x192 and 512x512 SVG icons
- **Install Prompts**: Automatic prompts to install the app on supported devices
- **Offline Support**: Basic functionality available without internet connection

## Deployment Options on Replit

### 1. Autoscale Deployment (Recommended)
- **Best for**: Production web applications with variable traffic
- **Features**: Automatic scaling, WebSocket support, cost-effective
- **How to deploy**: Click "Deploy" button in Replit editor → Select "Autoscale"
- **URL**: Your app gets a custom `.replit.app` domain
- **Cost**: Pay only for actual usage, scales to zero when idle

### 2. Static Deployment  
- **Best for**: If you build a static version of the app
- **Features**: Fast CDN delivery, very cost-effective
- **Limitation**: No backend server support (WebSocket/API won't work)

### 3. Reserved VM Deployment
- **Best for**: Always-on applications requiring dedicated resources
- **Features**: Dedicated virtual machine, predictable performance
- **Cost**: Fixed monthly cost regardless of usage

## Step-by-Step Deployment Guide

1. **Prepare for Deployment**
   - Your app is already configured with build scripts
   - PWA manifest and service worker are set up
   - All necessary files are in place

2. **Deploy on Replit**
   - Click the "Deploy" button in the top-right corner
   - Choose "Autoscale Deployment" (recommended)
   - Configure your deployment name and description
   - Click "Deploy" to publish

3. **Access Your Published App**
   - Replit provides a public URL (e.g., `your-app-name.replit.app`)
   - Share this URL with anyone to access your screen sharing app
   - The app works on desktop, tablet, and mobile devices

4. **Install as Mobile App**
   - Open the deployed URL on a mobile device
   - Browser will show "Add to Home Screen" prompt
   - Users can install it like a native app

## Updating Your Published App

1. **Make Changes**: Edit your code in the Replit editor
2. **Test Changes**: Run the app to ensure everything works
3. **Redeploy**: Click "Deploy" → "Update Deployment"
4. **Automatic Updates**: Changes go live immediately for all users

## Domain and Custom URLs

- **Free Domain**: Your app gets a free `.replit.app` subdomain
- **Custom Domain**: You can connect your own domain name through Replit's deployment settings
- **SSL/HTTPS**: Automatically included for security and PWA requirements

## Monitoring and Analytics

- **Built-in Analytics**: Replit provides deployment analytics and monitoring
- **Performance Tracking**: Monitor response times and usage patterns
- **Error Logging**: Automatic error tracking and reporting