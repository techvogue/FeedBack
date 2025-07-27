// src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Grid,
  Paper,
  Button,
  CircularProgress,
  Alert,
} from '@mui/material';
import { 
  Add as AddIcon, 
  Event as EventIcon,
  Dashboard as DashboardIcon 
} from '@mui/icons-material';

import axiosInstance from '../api/axiosInstance';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get('/dashboard/data');
        setDashboardData(response.data);
      } catch (err) {
        setError('Failed to load dashboard data');
        console.error('Dashboard data fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <CircularProgress size={60} />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      {/* Welcome Section */}
      <Box
        sx={{
          mb: 6,
          p: 4,
          background: 'rgba(255,255,255,0.3)',
          backdropFilter: 'blur(16px)',
          borderRadius: 3,
          border: '1px solid rgba(255,255,255,0.18)',
          boxShadow: '0 8px 32px 0 rgba(31,38,135,0.37)',
        }}
      >
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: '#1a1a1a' }}>
          Welcome back, {user?.name || 'User'}! 👋
        </Typography>
        <Typography variant="h6" color="textSecondary">
          Manage your events and collect feedback from attendees.
        </Typography>
      </Box>

      {/* Action Buttons */}
      <Grid container spacing={4} sx={{ mb: 6 }}>
        <Grid item xs={12} md={6}>
          <Paper
            sx={{
              p: 4,
              background: 'rgba(255,255,255,0.3)',
              backdropFilter: 'blur(16px)',
              borderRadius: 3,
              border: '1px solid rgba(255,255,255,0.18)',
              boxShadow: '0 8px 32px 0 rgba(31,38,135,0.37)',
              textAlign: 'center',
              transition: 'transform 0.2s ease-in-out',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 12px 40px 0 rgba(31,38,135,0.5)',
              }
            }}
          >
           
            <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold' }}>
              Create New Event
            </Typography>
          
            <Button
              variant="contained"
              size="large"
             
              onClick={() => navigate("/add-event")}
              sx={{
                background: 'rgba(255,255,255,0.2)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(255,255,255,0.18)',
                color: '#1a1a1a',
                px: 3,
                py: 1,
                fontSize: '1.1rem',
                '&:hover': {
                  background: 'rgba(255,255,255,0.3)',
                },
              }}
            >
              <AddIcon sx={{ fontSize: 30, color: '#1976d2', mr: 1}} /> Add Event
            </Button>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper
            sx={{
              p: 4,
              background: 'rgba(255,255,255,0.3)',
              backdropFilter: 'blur(16px)',
              borderRadius: 3,
              border: '1px solid rgba(255,255,255,0.18)',
              boxShadow: '0 8px 32px 0 rgba(31,38,135,0.37)',
              textAlign: 'center',
              transition: 'transform 0.2s ease-in-out',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 12px 40px 0 rgba(31,38,135,0.5)',
              }
            }}
          >
            
            <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold' }}>
              View Event List
            </Typography>
         
            <Button
              variant="contained"
              size="large"
              startIcon={<EventIcon sx={{ fontSize: 60, color: '#2e7d32', mb: 0 }} />}
              onClick={() => navigate("/my-events")}
              sx={{
                background: 'rgba(255,255,255,0.2)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(255,255,255,0.18)',
                color: '#1a1a1a',
                px: 3,
                py: 1,
                fontSize: '1.1rem',
                '&:hover': {
                  background: 'rgba(255,255,255,0.3)',
                },
              }}
            >
              View Events
            </Button>
          </Paper>
        </Grid>
      </Grid>

    
   
    </Container>
  );
};

export default Dashboard;