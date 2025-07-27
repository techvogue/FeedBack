import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from '../api/axiosInstance';
import {
  Box,
  Typography,
  Container,
  Paper,
  Button,
  CircularProgress,
  Alert,
  Stack,
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { QRCode } from "qrcode.react";

import { useSelector } from 'react-redux';

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // (1) Event data
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // (2) Feedback form state for this event
  const [feedbackForm, setFeedbackForm] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  // (3) Current user from Redux (assuming you store current user here)
  const currentUser = useSelector(state => state.auth.user);

  // Fetch event
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

  // Fetch feedback form for this event
  useEffect(() => {
    const fetchForm = async () => {
      setFormLoading(true);
      try {
        const res = await axios.get(`/feedback-form/${id}`);
        setFeedbackForm(res.data);
      } catch (err) {
        setFeedbackForm(null); // 404 or not created yet
      } finally {
        setFormLoading(false);
      }
    };
    if (event) fetchForm();
  }, [id, event]);

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <CircularProgress size={60} />
        </Box>
      </Container>
    );
  }

  if (error || !event) {
    return (
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Alert severity="error" sx={{ mb: 3 }}>{error || "Event not found"}</Alert>
      </Container>
    );
  }

  // Date/time formatting
  const eventDate = new Date(event.date);
  const formattedDate = eventDate.toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'short', day: 'numeric'
  });
  const formattedTime = eventDate.toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit'
  });

  // Determine user is owner
  const isOwner = currentUser && event.owner && (currentUser.id === event.owner.id);

  // Feedback form "Share" URL
  const feedbackUrl = `${window.location.origin}/feedback/${id}`;

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
        {/* Banner */}
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

          {/* Feedback form controls for owner */}
          {isOwner && (
            <Box sx={{ mt: 4 }}>
              {formLoading ? (
                <CircularProgress size={30} />
              ) : (
                <Stack spacing={2}>
                  {!feedbackForm ? (
                    <Button
                      variant="contained"
                      component={Link}
                      to={`/events/${id}/create-feedback`}
                      color="primary"
                    >
                      + Create Feedback Form
                    </Button>
                  ) : (
                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                      <Button
                        variant="contained"
                        component={Link}
                        to={`/events/${id}/edit-feedback`}
                        color="secondary"
                      >
                        Edit Feedback Form
                      </Button>
                      <Button
                        variant="outlined"
                        component={Link}
                        to={`/events/${id}/feedback-responses`}
                        color="inherit"
                      >
                        See Responses
                      </Button>
                      {/* Sharing: link + QR code */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Button
                          variant="outlined"
                          href={feedbackUrl}
                          target="_blank"
                          sx={{ minWidth: 170 }}
                        >
                          Share Feedback Form
                        </Button>
                        <Box>
                          <QRCode value={feedbackUrl} size={64} style={{ background: 'white', padding: 1, borderRadius: 5 }} />
                          <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', mt: 0.5 }}>
                            Scan to open
                          </Typography>
                        </Box>
                      </Box>
                    </Stack>
                  )}
                </Stack>
              )}
            </Box>
          )}

          {/* Public link/qr if NOT owner, but Feedback exists (optional) */}
          {!isOwner && feedbackForm && (
            <Box sx={{ mt: 4 }}>
              <Typography variant="subtitle1" sx={{ mb: 1, color: '#444' }}>
                Share your feedback about this event!
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Button
                  variant="outlined"
                  href={feedbackUrl}
                  target="_blank"
                >
                  Give Feedback
                </Button>
                <Box>
                  <QRCode value={feedbackUrl} size={56} style={{ background: 'white', borderRadius: 4 }} />
                </Box>
              </Box>
            </Box>
          )}
        </Box>
      </Paper>
    </Container>
  );
};

export default EventDetail;
