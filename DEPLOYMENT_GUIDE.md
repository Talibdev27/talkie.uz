# Local Deployment Guide

## Quick Start (5 minutes)

### Prerequisites
- Node.js 18+ installed
- PostgreSQL installed and running
- Git (optional)

### Step 1: Extract and Setup
```bash
# Extract the ZIP file to your desired location
cd wedding-planning-platform

# Run the automated setup
npm run setup

# Install dependencies
npm install
```

### Step 2: Database Configuration
1. Create a PostgreSQL database:
```bash
createdb wedding_planning_db
```

2. Update the `.env` file with your database credentials:
```bash
DATABASE_URL="postgresql://your_username:your_password@localhost:5432/wedding_planning_db"
```

### Step 3: Initialize Database
```bash
npm run db:push
```

### Step 4: Start the Application
```bash
npm run dev
```

Visit: `http://localhost:5000`

## Default User Setup

Since this is a fresh installation, you'll need to create your first user:

1. Go to `http://localhost:5000`
2. Click "Get Started" to create an account
3. The first user created will have admin privileges

## Database Management

### View Database (Optional)
```bash
npm run db:studio
```
Opens Drizzle Studio at `http://localhost:4983`

### Reset Database (if needed)
```bash
# Drop and recreate database
dropdb wedding_planning_db
createdb wedding_planning_db
npm run db:push
```

## Environment Variables Explained

```bash
# Required: PostgreSQL connection string
DATABASE_URL="postgresql://username:password@localhost:5432/database_name"

# Required: Session encryption key (auto-generated)
SESSION_SECRET="your-secret-key"

# Optional: Development settings
NODE_ENV="development"
PORT=5000
MAX_FILE_SIZE=5242880
UPLOAD_DIR="./uploads"
```

## Troubleshooting

### Database Connection Issues
```bash
# Check if PostgreSQL is running
pg_isready

# Test connection manually
psql -h localhost -U your_username -d wedding_planning_db
```

### Port Already in Use
```bash
# Change port in .env file
PORT=3000

# Or kill existing process
lsof -ti:5000 | xargs kill -9
```

### Permission Issues
```bash
# Make setup script executable
chmod +x setup-local.js

# Fix npm permissions (if needed)
sudo chown -R $(whoami) ~/.npm
```

## Production Deployment

For production use:

1. Set `NODE_ENV=production` in .env
2. Configure production database
3. Set a strong `SESSION_SECRET`
4. Use a process manager like PM2:
```bash
npm install -g pm2
npm run build
pm2 start "npm start" --name wedding-platform
```

## Features Available Locally

- Full wedding website creation
- Guest management with RSVP tracking
- Photo upload and galleries
- Multilingual support (English, Uzbek, Russian)
- Role-based access (Admin, Guest Manager, User)
- Real-time updates via WebSocket
- Guest book functionality

## File Upload Configuration

Files are stored in the `./uploads` directory. For production, consider:
- Using cloud storage (AWS S3, Cloudinary)
- Configuring file size limits
- Setting up proper backup procedures

## Development Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run db:push      # Update database schema
npm run db:studio    # Open database admin
npm run type-check   # Check TypeScript
```

## Support

The platform includes:
- Comprehensive error handling
- Detailed logging
- Input validation
- Security middleware
- Session management
- File upload protection

Check the browser console and server logs for debugging information.