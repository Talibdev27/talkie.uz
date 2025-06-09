# Wedding Platform - Quick Start Guide

## What You Need
- Node.js 18+
- PostgreSQL database
- 5 minutes

## Installation Steps

### 1. Extract ZIP and Navigate
```bash
cd wedding-planning-platform
```

### 2. Auto Setup
```bash
npm run setup
npm install
```

### 3. Create Database
```bash
createdb wedding_planning_db
```

### 4. Configure Database
Edit `.env` file - update this line:
```
DATABASE_URL="postgresql://YOUR_USERNAME:YOUR_PASSWORD@localhost:5432/wedding_planning_db"
```

### 5. Initialize & Start
```bash
npm run db:push
npm run dev
```

### 6. Access Application
Open: http://localhost:5000

## First User
- Click "Get Started" to create your admin account
- First registered user becomes admin automatically

## Language Support
- English, Uzbek, Russian available
- Switch languages using the dropdown in any interface

## User Roles
- **Admin**: Full access, user management
- **Guest Manager**: Limited to assigned wedding guest management  
- **User**: Manage own weddings

## Default Features
- Create wedding websites
- Manage guest lists and RSVPs
- Upload wedding photos
- Guest book messages
- Multilingual interface
- Real-time updates

Need help? Check DEPLOYMENT_GUIDE.md for detailed troubleshooting.