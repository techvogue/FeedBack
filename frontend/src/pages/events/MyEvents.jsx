import {
  Add as AddIcon,
  Event as EventIcon,
} from "@mui/icons-material";
import {
  Box,
  Button,
  CircularProgress,
  Grid,
  Pagination,
  Paper,
  Typography,
  useTheme,
} from "@mui/material";
import { motion } from 'framer-motion';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from "../../api/axiosInstance";
import EventCard from '../../components/events/EventCard';
import { getApiErrorMessage } from '../../utils/errorHandling';
import { notifyError } from '../../utils/notify';

void motion;

export default function MyEvents() {
  const EVENTS_PER_PAGE = 6;
  const navigate = useNavigate();
  const theme = useTheme();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get("/events");
      setEvents(response.data);
    } catch (err) {
      const message = getApiErrorMessage(err, "Failed to load events");
      notifyError(message);
      console.error("Fetch events error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const totalPages = Math.max(1, Math.ceil(events.length / EVENTS_PER_PAGE));

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const paginatedEvents = useMemo(() => {
    const start = (page - 1) * EVENTS_PER_PAGE;
    return events.slice(start, start + EVENTS_PER_PAGE);
  }, [events, page]);

  const handleDeleteEvent = async (eventId) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        await axios.delete(`/events/${eventId}`);
        setEvents(prevEvents => prevEvents.filter(event => event.id !== eventId));
      } catch (err) {
        const message = getApiErrorMessage(err, 'Failed to delete event.');
        notifyError(message);
      }
    }
  };

  const handleEditEvent = (eventId) => {
    navigate(`/edit-event/${eventId}`);
  };

  const handleEventClick = (eventId) => {
    navigate(`/dashboard/my-events/${eventId}`);
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
      width: '100%'
    }}>
      <Paper
        elevation={0}
        sx={{
          width: '100%',
          minHeight: '100vh',
          p: { xs: 2, sm: 4 },
          backgroundColor: theme.palette.background.paper,
          borderRadius: 0,
          boxShadow: theme.palette.mode === 'dark'
            ? '0 6px 20px rgba(0,0,0,0.3)'
            : '0 6px 20px rgba(0,0,0,0.08)',
          border: `1px solid ${theme.palette.divider}`,
          transition: 'all 0.3s ease-in-out',
        }}
      >
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
              onClick={() => navigate("/dashboard/create-event")}
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
          <>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color={theme.palette.text.secondary}>
                Showing {events.length === 0 ? 0 : (page - 1) * EVENTS_PER_PAGE + 1}-{Math.min(page * EVENTS_PER_PAGE, events.length)} of {events.length} events
              </Typography>
            </Box>

            <Grid container spacing={3}>
              {paginatedEvents.map((event, index) => (
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
                      onEventClick={handleEventClick}
                    />
                  </motion.div>
                </Grid>
              ))}
            </Grid>

            {totalPages > 1 && (
              <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={(_, value) => setPage(value)}
                  color="primary"
                  shape="rounded"
                  size="large"
                />
              </Box>
            )}
          </>
        )}
      </Paper>
    </Box>
  );
}
