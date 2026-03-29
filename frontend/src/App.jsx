// App.jsx
import { Box, CircularProgress, Toolbar } from '@mui/material';
import { Suspense, lazy } from 'react';
import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';

import AppToastContainer from './components/layout/AppToastContainer';
import Footer from './components/layout/Footer';
import Navbar from './components/layout/Navbar';
import ProtectedRoute from './components/layout/ProtectedRoute';
import { ColorModeProvider } from './context/ColorModeContext'; // ✅ Correct import

const Dashboard = lazy(() => import('./pages/dashboard/Dashboard'));
const EditEvent = lazy(() => import('./pages/events/EditEvent'));
const EventDetail = lazy(() => import('./pages/events/EventDetail'));
const Events = lazy(() => import('./pages/events/Events'));
const FeedbackPage = lazy(() => import('./pages/feedback/FeedbackPage'));
const Home = lazy(() => import('./pages/home/Home'));
const Login = lazy(() => import('./pages/auth/Login'));
const OAuthSuccess = lazy(() => import('./pages/auth/OAuthSuccess'));
const Register = lazy(() => import('./pages/auth/Register'));

const RouteFallback = () => (
  <Box
    sx={{
      minHeight: '50vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%'
    }}
  >
    <CircularProgress size={44} />
  </Box>
);

function App() {
  return (
    <ColorModeProvider>
      <Router>
        <Navbar />
        <Toolbar />
        <main style={{ margin: 0, padding: 0, width: '100%' }}>
          <Suspense fallback={<RouteFallback />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/oauth-success" element={<OAuthSuccess />} />
              <Route path="/events" element={<Events />} />
              <Route path="/events/:id/*" element={<EventDetail />} />
              <Route
                path="/dashboard/my-events/:id/*"
                element={
                  <ProtectedRoute>
                    <EventDetail />
                  </ProtectedRoute>
                }
              />
              <Route path="/feedback/:eventId" element={<FeedbackPage />} />
              <Route
                path="/dashboard/*"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/add-event"
                element={
                  <ProtectedRoute>
                    <Navigate to="/dashboard/create-event" replace />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/my-events"
                element={
                  <ProtectedRoute>
                    <Navigate to="/dashboard/my-events" replace />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/edit-event/:id"
                element={
                  <ProtectedRoute>
                    <EditEvent />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </Suspense>
        </main>
        <AppToastContainer />
        <Footer />
      </Router>
    </ColorModeProvider>
  );
}

export default App;
