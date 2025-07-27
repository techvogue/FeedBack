// src/components/MyEvents.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from "../api/axiosInstance";
import {
  Box,
  Typography,
  Grid, // Keep Grid for its layout capabilities
  Container,
  Button,
  CircularProgress,
  Alert,
  Paper,
} from "@mui/material";
import {
  Event as EventIcon,
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
} from "@mui/icons-material";

import EventCard from '../components/EventCard'; // <--- Ensure this path is correct: '../components/EventCard' or './EventCard' based on actual structure

export default function MyEvents() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Use useCallback to memoize fetchEvents to prevent unnecessary re-creation
  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError(""); // Clear previous errors
      const response = await axios.get("/events"); // This fetches ALL events, not just user's
      setEvents(response.data);
    } catch (err) {
      setError("Failed to load events");
      console.error("Fetch events error:", err);
    } finally {
      setLoading(false);
    }
  }, []); // Empty dependency array means it's created once

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]); // Dependency on fetchEvents (memoized)

  const handleDeleteEvent = async (eventId) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        await axios.delete(`/events/${eventId}`); // Use DELETE endpoint
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
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <CircularProgress size={60} />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper
        sx={{
          p: 4,
          background: 'rgba(255,255,255,0.3)',
          backdropFilter: 'blur(16px)',
          borderRadius: 3,
          border: '1px solid rgba(255,255,255,0.18)',
          boxShadow: '0 8px 32px 0 rgba(31,38,135,0.37)',
        }}
      >
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate("/dashboard")}
              sx={{ mr: 2 }}
            >
              Back to Dashboard
            </Button>
           
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate("/add-event")}
            sx={{ px: 3 }}
          >
            Add Event
          </Button>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Events Grid */}
        {events.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <EventIcon sx={{ fontSize: 80, color: '#1976d2', mb: 3, opacity: 0.7 }} />
            <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
              No Events Yet
            </Typography>
            <Typography variant="body1" color="textSecondary" sx={{ mb: 4, maxWidth: 500, mx: 'auto' }}>
              You haven't created any events yet. Start by creating your first event to collect feedback from attendees.
            </Typography>
            <Button
              variant="contained"
              size="large"
              startIcon={<AddIcon />}
              onClick={() => navigate("/add-event")}
              sx={{
                background: 'rgba(255,255,255,0.2)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(255,255,255,0.18)',
                color: '#1a1a1a',
                px: 4,
                py: 1.5,
                fontSize: '1.1rem',
                '&:hover': {
                  background: 'rgba(255,255,255,0.3)',
                },
              }}
            >
              Create Your First Event
            </Button>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {events.map((event) => (
              // <--- CRITICAL CHANGE HERE: lg={6} instead of lg={4}
              <Grid item xs={12} md={6} lg={6} key={event.id}>
                {/* Use the new EventCard component */}
                <EventCard
                  event={event}
                  onDelete={handleDeleteEvent}
                  onEdit={handleEditEvent}
                />
              </Grid>
            ))}
          </Grid>
        )}
      </Paper>
    </Container>
  );
}