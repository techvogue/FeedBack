# Event Feedback Web App

A modern full-stack authentication and protected routing system for an event feedback web application with glassmorphism design.

## 🚀 Tech Stack

### Frontend
- **React 19** - UI library
- **React Router** - Client-side routing
- **Redux Toolkit** - State management
- **Material-UI (MUI)** - Component library
- **Tailwind CSS** - Utility-first CSS (for glassmorphism)
- **Axios** - HTTP client

### Backend
- **Node.js** - Runtime environment
- **Express** - Web framework
- **Prisma ORM** - Database toolkit
- **PostgreSQL** - Database
- **Passport.js** - Authentication middleware
- **JWT** - Token-based authentication
- **Multer** - File upload handling
- **Cloudinary** - Cloud image storage
- **bcryptjs** - Password hashing

## 🐳 Docker Setup

### Prerequisites
- Docker Engine (Docker CLI) installed and running
- Docker Compose available
- **Recommended**: WSL2 with Docker Engine for Windows users

### Quick Start with Docker CLI

#### 1. Clone and Setup
```bash
git clone <your-repo-url>
cd FeedBack
```

#### 2. Environment Configuration
```bash
# Copy environment template
copy env.example .env

# Edit .env file with your actual values
# Update database credentials, API keys, etc.
```

#### 3. Start Development Environment
```bash
# Using Windows batch file
docker-scripts.bat dev-up

# Or manually with Docker Compose
docker-compose -f docker-compose.dev.yml up --build -d
```

#### 4. Start Production Environment
```bash
# Using Windows batch file
docker-scripts.bat prod-up

# Or manually with Docker Compose
docker-compose up --build -d
```

### Docker CLI Installation Options

#### Option 1: WSL2 with Docker Engine (Recommended)
```bash
# Install WSL2
wsl --install

# Install Docker Engine in WSL2
sudo apt update
sudo apt install docker-ce docker-ce-cli containerd.io docker-compose

# Start Docker service
sudo service docker start
```

#### Option 2: Docker Engine for Windows
- Download from [Docker Engine for Windows](https://docs.docker.com/engine/install/windows-install/)
- Install as Windows service

#### Option 3: Chocolatey
```bash
choco install docker-engine docker-compose
```

**📖 See [DOCKER_CLI_SETUP.md](DOCKER_CLI_SETUP.md) for detailed installation instructions.**

### Docker Commands

#### Development Environment
```bash
# Start development
docker-scripts.bat dev-up

# Stop development
docker-scripts.bat dev-down

# View development logs
docker-scripts.bat logs dev

# Show status
docker-scripts.bat status
```

#### Production Environment
```bash
# Start production
docker-scripts.bat prod-up

# Stop production
docker-scripts.bat prod-down

# View production logs
docker-scripts.bat logs

# Show status
docker-scripts.bat status
```

#### Utility Commands
```bash
# Clean up Docker resources
docker-scripts.bat cleanup

# Reset database (WARNING: deletes all data)
docker-scripts.bat reset-db

# Show help
docker-scripts.bat help
```

### Docker Testing
```bash
# Test your Docker CLI setup
test-docker.bat

# Test with help
test-docker.bat help
```

### Access Points
- **Development**: Frontend (5173), Backend (5000)
- **Production**: Frontend (80), Backend (5000)
- **Database**: PostgreSQL (5432)

### Docker File Structure
```
FeedBack/
├── backend/
│   ├── Dockerfile          # Production backend
│   └── Dockerfile.dev      # Development backend
├── frontend/
│   ├── Dockerfile          # Production frontend
│   └── Dockerfile.dev      # Development frontend
├── docker-compose.yml      # Production environment
├── docker-compose.dev.yml  # Development environment
├── docker-scripts.bat      # Windows batch file (CMD)
├── docker-scripts.ps1      # Windows PowerShell script
├── test-docker.bat         # Docker setup testing
├── DOCKER_CLI_SETUP.md     # Docker CLI installation guide
└── env.example             # Environment template
```

### Script Options

#### Windows Batch File (CMD)
```bash
# Development
docker-scripts.bat dev-up
docker-scripts.bat dev-down

# Production
docker-scripts.bat prod-up
docker-scripts.bat prod-down
```

#### PowerShell Script
```powershell
# Development
.\docker-scripts.ps1 dev-up
.\docker-scripts.ps1 dev-down

# Production
.\docker-scripts.ps1 prod-up
.\docker-scripts.ps1 prod-down
```

## ✨ Features

### Authentication
- ✅ Email/password registration and login
- ✅ Google OAuth2 integration
- ✅ JWT token-based authentication
- ✅ Protected routes and API endpoints
- ✅ Automatic token refresh handling

### User Interface
- ✅ Glassmorphism design throughout the app
- ✅ Responsive Material-UI components
- ✅ Modal-based login/signup forms
- ✅ Profile management with picture upload
- ✅ Protected dashboard with sample data

### Backend API
- ✅ RESTful API endpoints
- ✅ Secure password hashing
- ✅ File upload with Cloudinary
- ✅ CORS configuration
- ✅ Error handling middleware

## 📁 Project Structure

```
FeedBack/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── cloudinary.js
│   │   │   ├── multer.js
│   │   │   ├── passport-local.js
│   │   │   ├── passport-jwt.js
│   │   │   └── passport-google.js
│   │   ├── controllers/
│   │   │   └── authController.js
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   └── dashboard.js
│   │   ├── prismaClient.js
│   │   └── app.js
│   ├── prisma/
│   │   └── schema.prisma
│   ├── package.json
│   └── env.example
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── axiosInstance.js
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── LoginSignupModal.jsx
│   │   │   ├── ProfileModal.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   └── OAuthSuccess.jsx
│   │   ├── redux/
│   │   │   ├── slices/
│   │   │   │   └── authSlice.js
│   │   │   └── store.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── env.example
└── README.md
```

## 🛠️ Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL database
- Docker Desktop (for containerized setup)

### Manual Setup (without Docker)

#### Backend Setup
```bash
cd backend
npm install
cp env.example .env
# Edit .env with your database credentials
npx prisma generate
npx prisma migrate dev
npm run dev
```

#### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Docker Setup (Recommended)
```bash
# Test Docker setup
test-docker.bat

# Start development environment
docker-scripts.bat dev-up

# Start production environment
docker-scripts.bat prod-up
```

## 🔧 Environment Variables

### Required Variables
```bash
# Database
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_secure_password
POSTGRES_DB=feedback_db

# Backend
PORT=5000
SESSION_SECRET=your_very_secure_session_secret_key_here

# Frontend
FRONTEND_URL=http://localhost
```

### Optional Variables
```bash
# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# JWT
JWT_SECRET=your_jwt_secret_key_here

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Stripe
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key

# AI Features
GOOGLE_AI_API_KEY=your_google_ai_api_key
```

## 🚀 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/google` - Google OAuth initiation
- `GET /api/auth/google/callback` - Google OAuth callback
- `GET /api/auth/profile` - Get user profile (protected)
- `POST /api/auth/profile-picture` - Update profile picture (protected)

### Dashboard
- `GET /api/dashboard/data` - Get dashboard data (protected)

## 🎨 Glassmorphism Styling

The app uses glassmorphism design principles with:
- Semi-transparent backgrounds
- Backdrop blur effects
- Subtle borders and shadows
- Modern gradient backgrounds

Example styling:
```jsx
sx={{
  background: 'rgba(255,255,255,0.3)',
  backdropFilter: 'blur(16px)',
  border: '1px solid rgba(255,255,255,0.18)',
  boxShadow: '0 8px 32px 0 rgba(31,38,135,0.37)',
}}
```

## 🔒 Security Features

- JWT token authentication
- Password hashing with bcrypt
- Protected API routes
- CORS configuration
- Input validation
- File upload restrictions

## 📱 Responsive Design

The application is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile phones

## 🚀 Deployment

### Docker Deployment (Recommended)
```bash
# Build and start production
docker-scripts.bat prod-up

# Or manually
docker-compose up --build -d
```

### Manual Deployment

#### Backend Deployment
1. Set up a PostgreSQL database (e.g., on Heroku, Railway, or AWS)
2. Deploy to your preferred platform (Heroku, Railway, Vercel, etc.)
3. Set environment variables on your hosting platform
4. Run database migrations

#### Frontend Deployment
1. Build the application: `npm run build`
2. Deploy to your preferred platform (Vercel, Netlify, etc.)
3. Set environment variables

## 🐛 Troubleshooting

### Common Docker Issues

#### Port Already in Use
```bash
# Check what's using the port
netstat -ano | findstr :5000
netstat -ano | findstr :5173

# Kill the process or change ports in docker-compose files
```

#### Database Connection Issues
```bash
# Check database container status
docker-scripts.bat status

# View database logs
docker-compose logs db
```

#### Build Failures
```bash
# Clean up and rebuild
docker-scripts.bat cleanup
docker-scripts.bat dev-up
```

### Manual Troubleshooting
```bash
# Test Docker setup
test-docker.bat

# Check container logs
docker-scripts.bat logs dev
docker-scripts.bat logs

# Reset everything
docker-scripts.bat reset-db
docker-scripts.bat cleanup
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly with Docker
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

If you encounter any issues or have questions, please:
1. Check the documentation
2. Run `test-docker.bat` to verify your setup
3. Check Docker logs with `docker-scripts.bat logs`
4. Search existing issues
5. Create a new issue with detailed information

---

**Happy coding! 🎉** 