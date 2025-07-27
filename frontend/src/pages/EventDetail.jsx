import { ArrowBack as ArrowBackIcon, Edit as EditIcon, Share as ShareIcon, Visibility as ViewIcon } from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Grid,
  Paper,
  Typography
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import axios from '../api/axiosInstance';
import FeedbackFormCreator from '../components/FeedbackFormCreator';
import FeedbackShare from '../components/FeedbackShare';

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showFormCreator, setShowFormCreator] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [hasFeedbackForm, setHasFeedbackForm] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await axios.get(`/events/${id}`);
        setEvent(res.data);

        // Check if feedback form exists
        try {
          const feedbackRes = await axios.get(`/feedback/forms/${id}`);
          setHasFeedbackForm(true);
        } catch (err) {
          setHasFeedbackForm(false);
        }
      } catch (err) {
        setError('Failed to load event details');
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

  const isOwner = user && event && user.id === event.owner?.id;



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

  const handleFeedbackFormSaved = () => {
    setShowFormCreator(false);
    setHasFeedbackForm(true);
  };

  const handleShowFormCreator = () => {
    setShowFormCreator(true);
  };

  const handleGiveFeedback = () => {
    navigate(`/feedback/${id}`);
  };



  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      {showFormCreator ? (
        <FeedbackFormCreator
          eventId={id}
          onSave={handleFeedbackFormSaved}
          onCancel={() => setShowFormCreator(false)}
        />
      ) : (
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Paper
              sx={{
                p: 0,
                background: 'rgba(255,255,255,0.98)',
                borderRadius: 3,
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
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
                <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 2, color: '#2c3e50' }}>
                  {event.title}
                </Typography>
                <Typography variant="body1" sx={{ mb: 3, color: '#34495e', fontSize: '1.1rem' }}>
                  {event.description}
                </Typography>
                <Typography variant="subtitle1" sx={{ mb: 1, color: '#2c3e50' }}>
                  <strong style={{ color: '#3498db' }}>Date:</strong> {formattedDate}
                </Typography>
                <Typography variant="subtitle1" sx={{ mb: 1, color: '#2c3e50' }}>
                  <strong style={{ color: '#3498db' }}>Time:</strong> {formattedTime}
                </Typography>
                <Typography variant="subtitle2" sx={{ mt: 3, color: '#7f8c8d' }}>
                  <strong style={{ color: '#34495e' }}>Organized by:</strong> {event.owner?.name || 'Unknown'} ({event.owner?.email})
                </Typography>
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>

              {isOwner ? (
                // Owner controls
                <>
                  {!hasFeedbackForm ? (
                    <Button
                      variant="contained"
                      fullWidth
                      onClick={handleShowFormCreator}
                      sx={{
                        py: 2,
                        backgroundColor: '#3498db',
                        '&:hover': { backgroundColor: '#2980b9' }
                      }}
                    >
                      Create Feedback Form
                    </Button>
                  ) : (
                    <>
                      <Button
                        variant="outlined"
                        fullWidth
                        startIcon={<EditIcon />}
                        onClick={handleShowFormCreator}
                        sx={{
                          borderColor: '#3498db',
                          color: '#3498db',
                          '&:hover': { borderColor: '#2980b9', backgroundColor: 'rgba(52, 152, 219, 0.1)' }
                        }}
                      >
                        Edit Feedback Form
                      </Button>
                      <Button
                        variant="outlined"
                        fullWidth
                        startIcon={<ViewIcon />}
                        onClick={() => navigate(`/feedback/${id}`)}
                        sx={{
                          borderColor: '#27ae60',
                          color: '#27ae60',
                          '&:hover': { borderColor: '#229954', backgroundColor: 'rgba(39, 174, 96, 0.1)' }
                        }}
                      >
                        Preview Form
                      </Button>
                      <Button
                        variant="outlined"
                        fullWidth
                        startIcon={<ShareIcon />}
                        onClick={() => setShowShare(!showShare)}
                        sx={{
                          borderColor: '#f39c12',
                          color: '#f39c12',
                          '&:hover': { borderColor: '#e67e22', backgroundColor: 'rgba(243, 156, 18, 0.1)' }
                        }}
                      >
                        Share Form
                      </Button>
                    </>
                  )}
                </>
              ) : (
                // Public view
                hasFeedbackForm && (
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={handleGiveFeedback}
                    sx={{
                      py: 2,
                      backgroundColor: '#27ae60',
                      '&:hover': { backgroundColor: '#229954' }
                    }}
                  >
                    Give Feedback
                  </Button>
                )
              )}



              {showShare && hasFeedbackForm && (
                <FeedbackShare eventId={id} />
              )}
            </Box>
          </Grid>
        </Grid>
      )}
    </Container>
  );
};

export default EventDetail;
