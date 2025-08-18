import {
  Add as AddIcon,
  ArrowBack as ArrowBackIcon,
  Event as EventIcon,
} from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Grid,
  Paper,
  Typography,
  useTheme,
} from "@mui/material";
import { motion } from 'framer-motion';
import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from "../api/axiosInstance";
import EventCard from '../components/EventCard';

export default function MyEvents() {
  const navigate = useNavigate();
  const theme = useTheme();
  
  console.log('📍 Current Page: My Events Page');
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const response = await axios.get("/events");
      setEvents(response.data);
    } catch (err) {
      setError("Failed to load events");
      console.error("Fetch events error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleDeleteEvent = async (eventId) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        await axios.delete(`/events/${eventId}`);
        setEvents(prevEvents => prevEvents.filter(event => event.id !== eventId));
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete event.');
      }
    }
  };

  const handleEditEvent = (eventId) => {
    navigate(`/edit-event/${eventId}`);
  };

  if (loading) {
    return (
      <Box sx={{
        minHeight: '100vh',
        backgroundColor: theme.palette.background.default,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box sx={{
      backgroundColor: theme.palette.background.default,
      minHeight: '100vh',
      py: 6,
      px: 2
    }}>
      <Container maxWidth="lg">
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2, sm: 4 },
            backgroundColor: theme.palette.background.paper,
            borderRadius: 3,
            boxShadow: theme.palette.mode === 'dark'
              ? '0 6px 20px rgba(0,0,0,0.3)'
              : '0 6px 20px rgba(0,0,0,0.08)',
            border: `1px solid ${theme.palette.divider}`,
            transition: 'all 0.3s ease-in-out',
          }}
        >
          {/* Header */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              justifyContent: 'space-between',
              alignItems: { xs: 'flex-start', sm: 'center' },
              gap: 2,
              mb: 4,
            }}
          >
            <Typography variant="h4" fontWeight="bold" color={theme.palette.text.primary}>
              My Events
            </Typography>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate("/dashboard")}
                variant="outlined"
                sx={{
                  color: theme.palette.text.primary,
                  borderColor: theme.palette.divider,
                  '&:hover': {
                    backgroundColor: theme.palette.text.primary,
                    color: theme.palette.background.paper,
                    borderColor: theme.palette.text.primary,
                  },
                }}
              >
                Back to Dashboard
              </Button>

              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => navigate("/add-event")}
                sx={{
                  backgroundColor: theme.palette.primary.main,
                  color: theme.palette.primary.contrastText,
                  '&:hover': {
                    backgroundColor: theme.palette.primary.dark,
                  },
                }}
              >
                Add Event
              </Button>
            </Box>
          </Box>

          {/* Error Alert */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* Event Cards or Empty State */}
          {events.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <EventIcon sx={{
                fontSize: 80,
                color: theme.palette.primary.main,
                opacity: 0.7,
                mb: 2
              }} />
              <Typography variant="h5" fontWeight="bold" color={theme.palette.text.primary} gutterBottom>
                No Events Created
              </Typography>
              <Typography variant="body1" color={theme.palette.text.secondary} sx={{
                maxWidth: 500,
                mx: 'auto',
                mb: 4
              }}>
                You haven't created any events yet. Click below to create your first event and start collecting feedback.
              </Typography>
              <Button
                variant="contained"
                size="large"
                startIcon={<AddIcon />}
                onClick={() => navigate("/add-event")}
                sx={{
                  px: 4,
                  py: 1.5,
                  fontSize: '1.1rem',
                  backgroundColor: theme.palette.primary.main,
                  '&:hover': {
                    backgroundColor: theme.palette.primary.dark,
                  },
                }}
              >
                Create Your First Event
              </Button>
            </Box>
          ) : (
            <Grid container spacing={3}>
              {events.map((event, index) => (
                <Grid item xs={12} sm={6} md={4} key={event.id}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.4 }}
                  >
                    <EventCard
                      event={event}
                      onDelete={handleDeleteEvent}
                      onEdit={handleEditEvent}
                    />
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          )}
        </Paper>
      </Container>
    </Box>
  );
}
