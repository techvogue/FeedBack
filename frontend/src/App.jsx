// App.jsx
import { Toolbar } from '@mui/material';
import React from 'react';
import { Provider } from 'react-redux';
import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import store from './redux/store';

import Footer from './components/Footer';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import { ColorModeProvider } from './context/ColorModeContext'; // ✅ Correct import

import AddEvent from './pages/AddEvent';
import Dashboard from './pages/Dashboard';
import EditEvent from './pages/EditEvent';
import EventDetail from './pages/EventDetail';
import Events from './pages/Events';
import FeedbackPage from './pages/FeedbackPage';
import FeedbackResponsesPage from './pages/FeedbackResponsesPage';
import Home from './pages/Home';
import Login from './pages/Login';
import MyEvents from './pages/MyEvents';
import MyTickets from './pages/MyTickets';
import OAuthSuccess from './pages/OAuthSuccess';
import Register from './pages/Register';
import ThankYouPage from './pages/ThankYouPage';

function App() {
  return (
    <Provider store={store}>
      <ColorModeProvider>
        <Router>
          <Navbar />
          <Toolbar />
          <main style={{ margin: 0, padding: 0, width: '100%' }}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/oauth-success" element={<OAuthSuccess />} />
              <Route path="/events" element={<Events />} />
              <Route path="/events/:id" element={<EventDetail />} />
              <Route path="/feedback/:eventId" element={<FeedbackPage />} />
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
                path="/edit-event/:id"
                element={
                  <ProtectedRoute>
                    <EditEvent />
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
              <Route path="/thank-you" element={<ThankYouPage />} />
              <Route path="/my-tickets" element={<MyTickets />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>
          <Footer />
        </Router>
      </ColorModeProvider>
    </Provider>
  );
}

export default App;
