import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import FeedbackFormRenderer from '../components/FeedbackFormRenderer';
import { Box, Typography, Alert, CircularProgress, Button } from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';

const FeedbackPage = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
   
    if (!isAuthenticated) {
      navigate(`/login?redirect=/feedback/${eventId}`);
      return;
    }
  }, [isAuthenticated, navigate, eventId]);


  if (!isAuthenticated) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '60vh',
        flexDirection: 'column',
        gap: 2
      }}>
        <CircularProgress sx={{ color: '#3498db' }} />
        <Typography variant="body1" sx={{ color: '#7f8c8d' }}>
          Redirecting to login...
        </Typography>
      </Box>
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

        <Typography 
          variant="h3" 
          sx={{ 
            textAlign: 'center', 
            mb: 4, 
            color: 'white',
            fontWeight: 'bold',
            textShadow: '0 2px 4px rgba(0,0,0,0.3)'
          }}
        >
          Event Feedback
        </Typography>
        <FeedbackFormRenderer eventId={eventId} />
      </Box>
    </Box>
  );
};

export default FeedbackPage; 