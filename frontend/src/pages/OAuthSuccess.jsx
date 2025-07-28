import { Box, CircularProgress, Container, Typography } from '@mui/material';
import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { setCredentials } from '../redux/slices/authSlice';

const OAuthSuccess = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');

    if (token) {
      // Store the token
      localStorage.setItem('token', token);

      // Set credentials in Redux
      dispatch(setCredentials({ token, user: null }));

      // Fetch user profile to get complete user data
      const fetchUserProfile = async () => {
        try {
          const response = await axiosInstance.get('/auth/profile');
          const user = response.data;

          // Update Redux with complete user data
          dispatch(setCredentials({ token, user }));

          // Check for redirect parameter in URL
          const redirect = searchParams.get('redirect');

          if (redirect) {
            navigate(redirect, { replace: true });
          } else {
            navigate('/dashboard', { replace: true });
          }
        } catch (error) {
          console.error('Failed to fetch user profile:', error);
          // Check for redirect parameter even if profile fetch fails
          const redirect = searchParams.get('redirect');
          if (redirect) {
            navigate(redirect, { replace: true });
          } else {
            navigate('/dashboard', { replace: true });
          }
        }
      };

      fetchUserProfile();
    } else {
      // No token found, redirect to login
      navigate('/login', { replace: true });
    }
  }, [searchParams, navigate, dispatch]);

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          textAlign: 'center',
          p: 4,
          background: 'rgba(255,255,255,0.3)',
          backdropFilter: 'blur(16px)',
          borderRadius: 3,
          border: '1px solid rgba(255,255,255,0.18)',
          boxShadow: '0 8px 32px 0 rgba(31,38,135,0.37)',
        }}
      >
        <CircularProgress size={60} sx={{ mb: 3 }} />
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
          Authentication Successful!
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Please wait while we redirect you to your dashboard...
        </Typography>
      </Box>
    </Container>
  );
};

export default OAuthSuccess;
