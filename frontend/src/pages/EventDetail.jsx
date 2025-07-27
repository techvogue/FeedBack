import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../api/axiosInstance';
import {
  Box,
  Typography,
  Container,
  Paper,
  Button,
  CircularProgress,
  Alert,
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await axios.get(`/events/${id}`);
        setEvent(res.data);
      } catch (err) {
        setError('Failed to load event details');
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <CircularProgress size={60} />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
      </Container>
    );
  }

  if (!event) return null;

  const eventDate = new Date(event.date);
  const formattedDate = eventDate.toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'short', day: 'numeric'
  });
  const formattedTime = eventDate.toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit'
  });

  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Paper
        sx={{
          p: 0,
          background: 'rgba(255,255,255,0.95)',
          borderRadius: 3,
          boxShadow: '0 8px 32px 0 rgba(31,38,135,0.18)',
          overflow: 'hidden',
        }}
      >
        <Box sx={{ width: '100%', height: 220, overflow: 'hidden', background: '#f5f5f5' }}>
          <img
            src={event.bannerUrl || 'https://via.placeholder.com/600x220?text=Event+Banner'}
            alt={event.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </Box>
        <Box sx={{ p: 4 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(-1)}
            sx={{ mb: 2 }}
          >
            Back
          </Button>
          <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 2 }}>
            {event.title}
          </Typography>
          <Typography variant="body1" sx={{ mb: 3, color: '#333' }}>
            {event.description}
          </Typography>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            <strong>Date:</strong> {formattedDate}
          </Typography>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            <strong>Time:</strong> {formattedTime}
          </Typography>
          <Typography variant="subtitle2" sx={{ mt: 3, color: '#555' }}>
            <strong>Organized by:</strong> {event.owner?.name || 'Unknown'} ({event.owner?.email})
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default EventDetail; 