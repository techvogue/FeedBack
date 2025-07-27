import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Box, Button } from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import FeedbackFormRenderer from '../components/FeedbackFormRenderer';

const FeedbackPage = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();

  const handleComplete = () => {
    // Optionally redirect after completion
    setTimeout(() => {
      navigate('/');
    }, 3000);
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
          variant="outlined"
        >
          Back
        </Button>
      </Box>
      
      <FeedbackFormRenderer
        eventId={eventId}
        onComplete={handleComplete}
      />
    </Container>
  );
};

export default FeedbackPage; 