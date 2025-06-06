# Wedding Planning Platform

A comprehensive wedding planning platform that empowers couples to create personalized, multilingual wedding websites with advanced digital collaboration and management tools.

## Features

- **Wedding Website Builder**: Create beautiful, customizable wedding websites
- **Guest Management**: Comprehensive RSVP and guest tracking system
- **Photo Gallery**: Upload and share wedding photos with guests
- **Location Integration**: Interactive maps with ceremony details and directions
- **Payment Processing**: Integrated payment system for premium features
- **Admin Dashboard**: Advanced analytics and management tools
- **Multilingual Support**: Multiple language options for international couples

## Technology Stack

- **Frontend**: React.js with TypeScript, Tailwind CSS, Vite
- **Backend**: Node.js with Express, TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Passport.js with session management
- **File Upload**: Multer for photo management
- **Maps**: OpenStreetMap integration

## Deployment on Render

### Prerequisites
1. Create a Render account at [render.com](https://render.com)
2. Have your PostgreSQL database connection string ready

### Deployment Steps

1. **Create a new Web Service**:
   - Connect your GitHub repository or upload the project files
   - Choose "Node" as the environment
   - Set build command: `npm install && npm run build`
   - Set start command: `npm start`

2. **Environment Variables**:
   Set the following environment variables in Render dashboard:
   ```
   NODE_ENV=production
   DATABASE_URL=your_postgresql_connection_string
   ```

3. **Database Setup**:
   - Create a PostgreSQL database on Render or use external provider
   - Run database migrations after deployment

### Local Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   ```bash
   DATABASE_URL=your_postgresql_connection_string
   NODE_ENV=development
   ```

3. Push database schema:
   ```bash
   npm run db:push
   ```

4. Start development server:
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:5000`

## Project Structure

```
├── client/              # Frontend React application
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Application pages
│   │   ├── lib/         # Utilities and configurations
│   │   └── hooks/       # Custom React hooks
├── server/              # Backend Express application
│   ├── db.ts           # Database configuration
│   ├── routes.ts       # API routes
│   ├── storage.ts      # Data access layer
│   └── index.ts        # Server entry point
├── shared/              # Shared types and schemas
│   └── schema.ts       # Database schema definitions
└── uploads/            # File upload directory
```

## License

MIT License - see LICENSE file for details