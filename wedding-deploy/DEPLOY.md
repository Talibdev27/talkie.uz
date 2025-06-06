# Render Deployment Guide

## Quick Deploy Steps

1. **Upload to Render**:
   - Extract the tar.gz file
   - Create new Web Service on Render
   - Upload all files or connect via Git

2. **Configure Build Settings**:
   - Environment: Node
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`

3. **Environment Variables**:
   ```
   NODE_ENV=production
   DATABASE_URL=your_postgresql_connection_string
   ```

4. **Database Setup**:
   - Create PostgreSQL database on Render
   - Copy connection string to DATABASE_URL
   - Database tables will be created automatically

## Features Included

✅ Wedding website builder with multiple templates
✅ Location maps with ceremony time display  
✅ Photo gallery and guest management
✅ RSVP system and admin dashboard
✅ Payment processing integration
✅ Multilingual support

## Post-Deployment

After successful deployment:
1. Visit your app URL
2. Register first user (becomes admin)
3. Create wedding sites
4. Test location features and ceremony times

The location feature you requested is now live - guests can click the location pin to see the venue on a map with ceremony time and get directions.