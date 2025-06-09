#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

console.log('🎉 Setting up Wedding Planning Platform for local development...\n');

// Create .env file if it doesn't exist
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  const sessionSecret = crypto.randomBytes(32).toString('hex');
  const envContent = `# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/wedding_planning_db"

# Session Configuration  
SESSION_SECRET="${sessionSecret}"

# Server Configuration
NODE_ENV="development"
PORT=5000

# Optional: File Upload Settings
MAX_FILE_SIZE=5242880
UPLOAD_DIR="./uploads"
`;

  fs.writeFileSync(envPath, envContent);
  console.log('✅ Created .env file with default configuration');
  console.log('⚠️  Please update DATABASE_URL with your PostgreSQL credentials\n');
} else {
  console.log('✅ .env file already exists\n');
}

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('✅ Created uploads directory');
} else {
  console.log('✅ Uploads directory already exists');
}

// Create gitignore additions for local development
const gitignorePath = path.join(__dirname, '.gitignore');
const gitignoreAdditions = `
# Local development
.env
uploads/*
!uploads/.gitkeep
node_modules/
dist/
*.log
.DS_Store
`;

if (fs.existsSync(gitignorePath)) {
  const existingGitignore = fs.readFileSync(gitignorePath, 'utf8');
  if (!existingGitignore.includes('# Local development')) {
    fs.appendFileSync(gitignorePath, gitignoreAdditions);
    console.log('✅ Updated .gitignore for local development');
  }
} else {
  fs.writeFileSync(gitignorePath, gitignoreAdditions);
  console.log('✅ Created .gitignore file');
}

// Create uploads/.gitkeep
const gitkeepPath = path.join(uploadsDir, '.gitkeep');
if (!fs.existsSync(gitkeepPath)) {
  fs.writeFileSync(gitkeepPath, '');
  console.log('✅ Created uploads/.gitkeep');
}

console.log('\n🚀 Setup complete! Next steps:');
console.log('1. Install dependencies: npm install');
console.log('2. Update DATABASE_URL in .env with your PostgreSQL credentials');
console.log('3. Create the database: createdb wedding_planning_db');
console.log('4. Push database schema: npm run db:push');
console.log('5. Start the application: npm run dev');
console.log('\n📚 For detailed instructions, see README.md');