import React from 'react';
import { Box, Typography, Button, Container, Grid, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const Home = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      {/* Hero Section */}
      <Box
        sx={{
          textAlign: 'center',
          mb: 8,
          p: 6,
          background: 'rgba(255,255,255,0.3)',
          backdropFilter: 'blur(16px)',
          borderRadius: 3,
          border: '1px solid rgba(255,255,255,0.18)',
          boxShadow: '0 8px 32px 0 rgba(31,38,135,0.37)',
        }}
      >
        <Typography
          variant="h2"
          component="h1"
          gutterBottom
          sx={{
            fontWeight: 'bold',
            color: '#1a1a1a',
            mb: 3,
          }}
        >
          Welcome to Event Feedback
        </Typography>
        <Typography
          variant="h5"
          color="textSecondary"
          paragraph
          sx={{ mb: 4, maxWidth: 600, mx: 'auto' }}
        >
          Collect, analyze, and improve your events with our comprehensive feedback system.
          Get real-time insights from your attendees and make every event better than the last.
        </Typography>
        <Button
          variant="contained"
          size="large"
          onClick={() => navigate(isAuthenticated ? '/dashboard' : '/login')}
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
          {isAuthenticated ? 'Go to Dashboard' : 'Get Started'}
        </Button>
      </Box>

      {/* Features Section */}
      <Grid container spacing={4} sx={{ mb: 8 }}>
        <Grid item xs={12} md={4}>
          <Paper
            sx={{
              p: 4,
              height: '100%',
              background: 'rgba(255,255,255,0.3)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(255,255,255,0.18)',
              boxShadow: '0 8px 32px 0 rgba(31,38,135,0.37)',
              textAlign: 'center',
            }}
          >
            <Typography variant="h4" component="h3" gutterBottom sx={{ fontWeight: 'bold' }}>
              📊 Analytics
            </Typography>
            <Typography variant="body1" color="textSecondary">
              Get detailed analytics and insights from your event feedback. Track trends, identify areas for improvement, and measure success.
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper
            sx={{
              p: 4,
              height: '100%',
              background: 'rgba(255,255,255,0.3)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(255,255,255,0.18)',
              boxShadow: '0 8px 32px 0 rgba(31,38,135,0.37)',
              textAlign: 'center',
            }}
          >
            <Typography variant="h4" component="h3" gutterBottom sx={{ fontWeight: 'bold' }}>
              🔒 Secure
            </Typography>
            <Typography variant="body1" color="textSecondary">
              Your data is protected with enterprise-grade security. JWT authentication, encrypted storage, and secure API endpoints.
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper
            sx={{
              p: 4,
              height: '100%',
              background: 'rgba(255,255,255,0.3)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(255,255,255,0.18)',
              boxShadow: '0 8px 32px 0 rgba(31,38,135,0.37)',
              textAlign: 'center',
            }}
          >
            <Typography variant="h4" component="h3" gutterBottom sx={{ fontWeight: 'bold' }}>
              🚀 Modern
            </Typography>
            <Typography variant="body1" color="textSecondary">
              Built with the latest technologies including React, Material-UI, and glassmorphism design for a beautiful user experience.
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* CTA Section */}
      <Box
        sx={{
          textAlign: 'center',
          p: 6,
          background: 'rgba(255,255,255,0.3)',
          backdropFilter: 'blur(16px)',
          borderRadius: 3,
          border: '1px solid rgba(255,255,255,0.18)',
          boxShadow: '0 8px 32px 0 rgba(31,38,135,0.37)',
        }}
      >
        <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 'bold' }}>
          Ready to improve your events?
        </Typography>
        <Typography variant="body1" color="textSecondary" sx={{ mb: 4 }}>
          Join thousands of event organizers who trust our platform for their feedback needs.
        </Typography>
        <Button
          variant="outlined"
          size="large"
          onClick={() => navigate(isAuthenticated ? '/dashboard' : '/register')}
          sx={{
            borderColor: 'rgba(255,255,255,0.3)',
            color: '#1a1a1a',
            px: 4,
            py: 1.5,
            fontSize: '1.1rem',
            '&:hover': {
              borderColor: 'rgba(255,255,255,0.5)',
              background: 'rgba(255,255,255,0.1)',
            },
          }}
        >
          {isAuthenticated ? 'Access Dashboard' : 'Start Free Trial'}
        </Button>
      </Box>
    </Container>
  );
};

export default Home; 