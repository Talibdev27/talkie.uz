# Wedding Planning Platform

## Overview

This is a comprehensive wedding planning platform that enables couples to create personalized, multilingual wedding websites with advanced digital collaboration and management tools. The platform supports multiple user roles (admin, guest_manager, user) and provides features for guest management, photo galleries, RSVP tracking, and real-time collaboration.

## System Architecture

### Frontend Architecture
- **Framework**: React.js with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **Styling**: Tailwind CSS with custom design system using CSS variables
- **UI Components**: Radix UI components with shadcn/ui component library
- **State Management**: TanStack Query (React Query) for server state
- **Routing**: Wouter for lightweight client-side routing
- **Internationalization**: react-i18next with support for English, Uzbek, and Russian

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript for type safety
- **Authentication**: JWT-based authentication with role-based access control
- **File Uploads**: Multer for handling photo uploads
- **Security**: Helmet for security headers, rate limiting for production

### Database Architecture
- **Database**: PostgreSQL with connection pooling
- **ORM**: Drizzle ORM for type-safe database operations
- **Migrations**: Drizzle Kit for schema management
- **Connection**: Neon serverless PostgreSQL with WebSocket support

## Key Components

### Authentication & Authorization
- JWT token-based authentication
- Role-based access control (admin, guest_manager, user)
- Middleware for route protection and ownership verification
- Session management with secure token storage

### User Management
- Multi-role user system
- Admin dashboard for user management
- Guest manager role for restricted wedding management
- User registration and login flows

### Wedding Management
- Wedding creation with customizable templates
- Multi-language wedding sites
- Venue integration with map coordinates
- Background music and photo customization
- Public/private wedding settings

### Guest Management
- Comprehensive RSVP system
- Guest categorization (family, friends, colleagues)
- Real-time guest response tracking
- Bulk guest management operations
- Guest collaboration features

### Media Management
- Photo gallery system
- Couple photo uploads
- Smart image upload with compression
- File storage with secure access

### Real-time Features
- WebSocket integration for live updates
- Real-time RSVP notifications
- Live guest list updates

## Data Flow

### User Registration & Wedding Creation
1. User registers and receives JWT token
2. User creates wedding with selected template and customization
3. Unique URL generated for wedding site
4. Wedding data stored with user ownership

### Guest Management Flow
1. Wedding owner adds guests to wedding
2. Guests receive invitations with unique links
3. Guests RSVP through wedding site
4. Real-time updates sent to wedding management dashboard
5. Wedding owner can track and manage responses

### Photo Sharing Flow
1. Wedding owner uploads couple photos
2. Guests can view photos on wedding site
3. Photos stored securely with proper access control

### Multi-language Support
1. i18next configuration loads appropriate translations
2. Language switcher updates browser storage
3. Wedding sites respect default language settings
4. Real-time language switching without page reload

## External Dependencies

### Payment Integration
- **Uzbekistan Payment Gateways**: Payme, Click, Paycom
- Payment verification and subscription management
- Secure payment URL generation and redirect handling

### Map Integration
- Venue location mapping with coordinates
- Map pin URL generation for venue details

### File Storage
- Local file storage with organized directory structure
- Secure file upload handling with validation
- Image optimization for web display

## Deployment Strategy

### Development Environment
- Replit-based development with auto-reload
- Environment variable configuration
- Hot module replacement for fast development

### Production Deployment
- Vite build for optimized frontend assets
- ESBuild for server bundling
- Autoscale deployment target
- PostgreSQL database with connection pooling

### Database Management
- Migration-based schema updates
- Drizzle Studio for database inspection
- Backup and recovery strategies

### Security Considerations
- Data isolation between users enforced at API level
- Wedding ownership verification middleware
- Rate limiting for authentication endpoints
- Secure file upload validation
- CORS and CSP headers configured

## Recent Changes
- June 25, 2025: Successfully migrated from Replit Agent to standard Replit environment
- June 25, 2025: Fixed admin authentication system with proper environment variable handling
- June 25, 2025: Created PostgreSQL database and applied schema migrations
- June 25, 2025: Resolved host blocking issues with custom Vite configuration
- June 25, 2025: Admin login now working with credentials: Username: Talibdev, Password: Dilnoza2003

## Changelog
- June 25, 2025: Initial setup and migration completion

## User Preferences

Preferred communication style: Simple, everyday language.