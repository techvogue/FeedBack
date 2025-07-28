import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Paper,
  Button,
  CircularProgress,
  Alert,
  Grid,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Share as ShareIcon,
  Visibility as ViewIcon,
  Assessment as AssessmentIcon,
} from '@mui/icons-material';
import FeedbackFormCreator from '../components/FeedbackFormCreator';
import FeedbackShare from '../components/FeedbackShare';
import axios from '../api/axiosInstance';

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [hasFeedbackForm, setHasFeedbackForm] = useState(false);
  const [showFormCreator, setShowFormCreator] = useState(false);
  const [showShare, setShowShare] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await axios.get(`/events/${id}`);
        setEvent(response.data);
        
        // Check if feedback form exists
        try {
          const feedbackResponse = await axios.get(`/feedback/forms/${id}`);
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

  const handleShowFormCreator = () => {
    setShowFormCreator(true);
  };

  const handleFormSaved = () => {
    setShowFormCreator(false);
    setHasFeedbackForm(true);
  };

  const handleGiveFeedback = () => {
    navigate(`/feedback/${id}`);
  };

  const handleViewResponses = () => {
    navigate(`/events/${id}/responses`);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!event) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        Event not found
      </Alert>
    );
  }

  const isOwner = user && event.owner?.id === user.id;
  const formattedDate = new Date(event.date).toLocaleDateString();
  const formattedTime = new Date(event.date).toLocaleTimeString();

  if (showFormCreator) {
    return (
      <FeedbackFormCreator
        eventId={id}
        onSave={handleFormSaved}
        onCancel={() => setShowFormCreator(false)}
      />
    );
  }

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      py: 4,
      px: 2
    }}>
      <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
        {/* Back Button */}
        <Box sx={{ mb: 3 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(-1)}
            variant="outlined"
            sx={{
              color: 'white',
              borderColor: 'rgba(255,255,255,0.3)',
              '&:hover': {
                borderColor: 'white',
                backgroundColor: 'rgba(255,255,255,0.1)'
              }
            }}
          >
            Back
          </Button>
        </Box>

        <Grid container spacing={3}>
          {/* Event Details */}
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
              <Box
                component="img"
                src={event.bannerUrl}
                alt={event.title}
                sx={{
                  width: '100%',
                  height: 300,
                  objectFit: 'cover',
                }}
              />
              <Box sx={{ p: 4 }}>
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

          {/* Action Buttons */}
          <Grid item xs={12} md={4}>
            <Paper
              sx={{
                p: 3,
                background: 'rgba(255,255,255,0.98)',
                borderRadius: 3,
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                height: 'fit-content',
              }}
            >
              {isOwner ? (
                // Owner view
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
                        startIcon={<AssessmentIcon />}
                        onClick={handleViewResponses}
                        sx={{
                          borderColor: '#9b59b6',
                          color: '#9b59b6',
                          '&:hover': { borderColor: '#8e44ad', backgroundColor: 'rgba(155, 89, 182, 0.1)' }
                        }}
                      >
                        See Responses
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
                  <>
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
                    <Typography variant="body2" sx={{ 
                      mt: 1, 
                      textAlign: 'center', 
                      color: '#7f8c8d',
                      fontSize: '0.9rem'
                    }}>
                      Login required to submit feedback
                    </Typography>
                  </>
                )
              )}

              {showShare && hasFeedbackForm && (
                <Box sx={{ mt: 3 }}>
                  <FeedbackShare eventId={id} />
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default EventDetail;
