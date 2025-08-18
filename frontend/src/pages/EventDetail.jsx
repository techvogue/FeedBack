import {
  ArrowBack as ArrowBackIcon,
  Assessment as AssessmentIcon,
  Edit as EditIcon,
  Payment as PaymentIcon,
  Share as ShareIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Grid,
  Paper,
  Typography,
  useTheme,
} from '@mui/material';

import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import axios from '../api/axiosInstance';
import BuyTicketModal from '../components/BuyTicketModal';
import FeedbackFormCreator from '../components/FeedbackFormCreator';
import FeedbackFormPreviewModal from '../components/FeedbackFormPreviewModal';
import FeedbackShare from '../components/FeedbackShare';
import { useFeedbackForm } from '../hooks/useFeedbackForm';

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  console.log('📍 Current Page: Event Detail Page', { eventId: id });
  const theme = useTheme();
  const { user } = useSelector((state) => state.auth);
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { hasFeedbackForm, isChecking: isCheckingFeedbackForm, refresh: refreshFeedbackForm } = useFeedbackForm(id);
  const [showFormCreator, setShowFormCreator] = useState(false);
  const [showShare, setShowShare] = useState(false);

  const [previewFormData, setPreviewFormData] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showBuyTicket, setShowBuyTicket] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await axios.get(`/events/${id}`);
        setEvent(response.data);


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
    // Refresh the feedback form status after saving
    refreshFeedbackForm();
  };

  const handleGiveFeedback = () => {
    navigate(`/feedback/${id}`);
  };

  const handleViewResponses = () => {
    navigate(`/events/${id}/responses`);
  };

  const handlePreviewForm = async () => {
    try {
      const response = await axios.get(`/feedback/forms/${id}`);
      setPreviewFormData(response.data);
      setShowPreview(true);
    } catch (error) {
      if (error.response?.status === 404) {
        // No feedback form exists - this is expected behavior
        console.info('No feedback form exists for this event yet');
      } else {
        console.error('Failed to fetch feedback form preview:', error);
      }
    }
  };

  const handleBuyTicket = () => {
    setShowBuyTicket(true);
  };

  const handleTicketSuccess = () => {
    setShowBuyTicket(false);
    // Stripe will redirect to thank you page automatically
  };

  if (loading) {
    return (
      <Box sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: theme.palette.background.default
      }}>
        <CircularProgress size={60} />
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
  const isAuthenticated = !!user;
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
      background: theme.palette.background.default,
      py: 4,
      px: 2
    }}>
      <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
        <Box sx={{ mb: 3 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(-1)}
            variant="outlined"
            sx={{
              color: theme.palette.mode === 'dark' ? 'white' : 'white',
              borderColor: theme.palette.mode === 'dark'
                ? 'rgba(255,255,255,0.3)'
                : 'rgba(255,255,255,0.3)',
              '&:hover': {
                borderColor: 'white',
                backgroundColor: theme.palette.mode === 'dark'
                  ? 'rgba(255,255,255,0.1)'
                  : 'rgba(255,255,255,0.1)'
              }
            }}
          >
            Back
          </Button>
        </Box>

        <Grid container spacing={3}>
          <Grid xs={12} md={8}>
            <Paper
              sx={{
                p: 0,
                background: theme.palette.background.paper,
                borderRadius: 3,
                boxShadow: theme.palette.mode === 'dark'
                  ? '0 8px 32px rgba(0,0,0,0.3)'
                  : '0 8px 32px rgba(0,0,0,0.1)',
                overflow: 'hidden',
                border: `1px solid ${theme.palette.divider}`,
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
                <Typography variant="h4" sx={{
                  fontWeight: 'bold',
                  mb: 2,
                  color: theme.palette.text.primary
                }}>
                  {event.title}
                </Typography>
                <Typography variant="body1" sx={{
                  mb: 3,
                  color: theme.palette.text.secondary,
                  fontSize: '1.1rem'
                }}>
                  {event.description}
                </Typography>
                <Typography variant="subtitle1" sx={{
                  mb: 1,
                  color: theme.palette.text.primary
                }}>
                  <strong style={{ color: theme.palette.primary.main }}>Date:</strong> {formattedDate}
                </Typography>
                <Typography variant="subtitle1" sx={{
                  mb: 1,
                  color: theme.palette.text.primary
                }}>
                  <strong style={{ color: theme.palette.primary.main }}>Time:</strong> {formattedTime}
                </Typography>
                <Typography variant="subtitle1" sx={{
                  mb: 1,
                  color: theme.palette.text.primary
                }}>
                  <strong style={{ color: theme.palette.primary.main }}>Ticket Price:</strong>
                  {event.ticketPrice && event.ticketPrice > 0 ? (
                    <span style={{
                      color: theme.palette.success.main,
                      fontWeight: 'bold',
                      marginLeft: 8
                    }}>
                      ₹{parseFloat(event.ticketPrice).toFixed(2)}
                    </span>
                  ) : (
                    <span style={{
                      color: theme.palette.success.main,
                      fontWeight: 'bold',
                      marginLeft: 8
                    }}>
                      Free Event
                    </span>
                  )}
                </Typography>
                <Typography variant="subtitle2" sx={{
                  mt: 3,
                  color: theme.palette.text.secondary
                }}>
                  <strong style={{ color: theme.palette.text.primary }}>Organized by:</strong> {event.owner?.name || 'Unknown'} ({event.owner?.email})
                </Typography>
              </Box>
            </Paper>


          </Grid>

          <Grid xs={12} md={4}>
            <Paper
              sx={{
                p: 3,
                background: theme.palette.background.paper,
                borderRadius: 3,
                boxShadow: theme.palette.mode === 'dark'
                  ? '0 8px 32px rgba(0,0,0,0.3)'
                  : '0 8px 32px rgba(0,0,0,0.1)',
                height: 'fit-content',
                border: `1px solid ${theme.palette.divider}`,
              }}
            >
              {isOwner ? (
                <>
                  {!hasFeedbackForm ? (
                    <Button
                      variant="contained"
                      fullWidth
                      onClick={handleShowFormCreator}
                      sx={{
                        py: 2,
                        backgroundColor: theme.palette.primary.main,
                        '&:hover': {
                          backgroundColor: theme.palette.primary.dark
                        }
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
                          mb: 2,
                          borderColor: theme.palette.primary.main,
                          color: theme.palette.primary.main,
                          fontWeight: 'bold',
                          '&:hover': {
                            borderColor: theme.palette.primary.dark,
                            backgroundColor: theme.palette.mode === 'dark'
                              ? 'rgba(25, 118, 210, 0.08)'
                              : 'rgba(25, 118, 210, 0.04)',
                            transform: 'translateY(-1px)'
                          },
                          transition: 'all 0.3s ease'
                        }}
                      >
                        Edit Feedback Form
                      </Button>
                      <Button
                        variant="outlined"
                        fullWidth
                        startIcon={<ViewIcon />}
                        onClick={handlePreviewForm}
                        sx={{
                          mb: 2,
                          borderColor: theme.palette.success.main,
                          color: theme.palette.success.main,
                          fontWeight: 'bold',
                          '&:hover': {
                            borderColor: theme.palette.success.dark,
                            backgroundColor: theme.palette.mode === 'dark'
                              ? 'rgba(76, 175, 80, 0.08)'
                              : 'rgba(76, 175, 80, 0.04)',
                            transform: 'translateY(-1px)'
                          },
                          transition: 'all 0.3s ease'
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
                          mb: 2,
                          borderColor: theme.palette.secondary.main,
                          color: theme.palette.secondary.main,
                          fontWeight: 'bold',
                          '&:hover': {
                            borderColor: theme.palette.secondary.dark,
                            backgroundColor: theme.palette.mode === 'dark'
                              ? 'rgba(156, 39, 176, 0.08)'
                              : 'rgba(156, 39, 176, 0.04)',
                            transform: 'translateY(-1px)'
                          },
                          transition: 'all 0.3s ease'
                        }}
                      >
                        View Analytics
                      </Button>
                      <Button
                        variant="contained"
                        fullWidth
                        startIcon={<ShareIcon />}
                        onClick={() => setShowShare(true)}
                        sx={{
                          backgroundColor: theme.palette.warning.main,
                          color: theme.palette.warning.contrastText,
                          fontWeight: 'bold',
                          '&:hover': {
                            backgroundColor: theme.palette.warning.dark,
                            transform: 'translateY(-1px)',
                            boxShadow: theme.palette.mode === 'dark'
                              ? '0 4px 12px rgba(255, 152, 0, 0.3)'
                              : '0 4px 12px rgba(255, 152, 0, 0.3)'
                          },
                          transition: 'all 0.3s ease'
                        }}
                      >
                        Share Form
                      </Button>
                    </>
                  )}
                </>
              ) : (
                <>
                  {event.ticketPrice && event.ticketPrice > 0 ? (
                    <Button
                      variant="contained"
                      fullWidth
                      startIcon={<PaymentIcon />}
                      onClick={handleBuyTicket}
                      sx={{
                        py: 2,
                        mb: 2,
                        backgroundColor: theme.palette.error.main,
                        '&:hover': {
                          backgroundColor: theme.palette.error.dark
                        }
                      }}
                    >
                      Buy Ticket - ₹{parseFloat(event.ticketPrice).toFixed(2)}
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      fullWidth
                      startIcon={<PaymentIcon />}
                      disabled
                      sx={{
                        py: 2,
                        mb: 2,
                        backgroundColor: theme.palette.grey[400],
                        '&:hover': {
                          backgroundColor: theme.palette.grey[400]
                        }
                      }}
                    >
                      Free Event
                    </Button>
                  )}

                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={handleGiveFeedback}
                    sx={{
                      py: 2,
                      borderColor: theme.palette.success.main,
                      color: theme.palette.success.main,
                      '&:hover': {
                        borderColor: theme.palette.success.dark,
                        backgroundColor: theme.palette.mode === 'dark'
                          ? 'rgba(76, 175, 80, 0.08)'
                          : 'rgba(76, 175, 80, 0.04)'
                      }
                    }}
                  >
                    Give Feedback
                  </Button>
                </>
              )}


            </Paper>
          </Grid>
        </Grid>
      </Box>

      {/* Share Feedback Form Modal */}
      {showShare && hasFeedbackForm && (
        <FeedbackShare
          eventId={id}
          open={showShare}
          onClose={() => setShowShare(false)}
        />
      )}

      {/* Feedback Form Preview Modal */}
      <FeedbackFormPreviewModal
        open={showPreview}
        onClose={() => setShowPreview(false)}
        formData={previewFormData}
        eventTitle={event?.title}
      />

      {/* Buy Ticket Modal */}
      <BuyTicketModal
        open={showBuyTicket}
        onClose={() => setShowBuyTicket(false)}
        event={event}
        onSuccess={handleTicketSuccess}
      />
    </Box>
  );
};

export default EventDetail;
