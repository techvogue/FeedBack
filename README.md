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
- Google OAuth2 credentials
- Cloudinary account

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` with your actual values:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/event_feedback_db"
   JWT_SECRET="your-super-secret-jwt-key-here"
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"
   CLOUDINARY_CLOUD_NAME="your-cloudinary-cloud-name"
   CLOUDINARY_API_KEY="your-cloudinary-api-key"
   CLOUDINARY_API_SECRET="your-cloudinary-api-secret"
   FRONTEND_URL="http://localhost:5173"
   PORT=5000
   ```

4. **Set up database:**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Start the server:**
   ```bash
   npm run dev
   ```

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env`:
   ```env
   VITE_API_URL="http://localhost:5000/api"
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

## 🔧 Configuration

### Google OAuth2 Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `http://localhost:5000/api/auth/google/callback` (development)
   - `https://yourdomain.com/api/auth/google/callback` (production)

### Cloudinary Setup
1. Sign up at [Cloudinary](https://cloudinary.com/)
2. Get your cloud name, API key, and API secret
3. Add them to your backend `.env` file

### Database Setup
1. Create a PostgreSQL database
2. Update the `DATABASE_URL` in your backend `.env` file
3. Run Prisma migrations

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

### Backend Deployment
1. Set up a PostgreSQL database (e.g., on Heroku, Railway, or AWS)
2. Deploy to your preferred platform (Heroku, Railway, Vercel, etc.)
3. Set environment variables on your hosting platform
4. Run database migrations

### Frontend Deployment
1. Build the application: `npm run build`
2. Deploy to your preferred platform (Vercel, Netlify, etc.)
3. Set environment variables

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

If you encounter any issues or have questions, please:
1. Check the documentation
2. Search existing issues
3. Create a new issue with detailed information

---

**Happy coding! 🎉** 