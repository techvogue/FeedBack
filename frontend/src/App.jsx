import { CssBaseline } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import React from 'react';
import { Provider } from 'react-redux';
import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import './App.css';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import AddEvent from './pages/AddEvent';
import Dashboard from './pages/Dashboard';
import EditEvent from './pages/EditEvent';
import EventDetail from './pages/EventDetail';
import FeedbackPage from './pages/FeedbackPage';
import FeedbackResponsesPage from './pages/FeedbackResponsesPage';
import Home from './pages/Home';
import Login from './pages/Login';
import MyEvents from './pages/MyEvents';
import OAuthSuccess from './pages/OAuthSuccess';
import Register from './pages/Register';
import store from './redux/store';

// Create theme with glassmorphism support
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          minHeight: '100vh',
          margin: 0,
          padding: 0,
        },
      },
    },
  },
});

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <div className="App">
            <Navbar />
            <main>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/oauth-success" element={<OAuthSuccess />} />
                <Route
                  path="/dashboard"
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
                      <AddEvent />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/my-events"
                  element={
                    <ProtectedRoute>
                      <MyEvents />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/events/:id"
                  element={
                    <ProtectedRoute>
                      <EventDetail />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/events/:eventId/responses"
                  element={
                    <ProtectedRoute>
                      <FeedbackResponsesPage />
                    </ProtectedRoute>
                  }
                />
                <Route path="/feedback/:eventId" element={<FeedbackPage />} />
                <Route
                  path="/edit-event/:id"
                  element={
                    <ProtectedRoute>
                      <EditEvent />
                    </ProtectedRoute>
                  }
                />
                {/* Redirect any unknown routes to home */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
          </div>
        </Router>
      </ThemeProvider>
    </Provider>
  );
}

export default App;
