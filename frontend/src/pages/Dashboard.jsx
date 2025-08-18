import { Add as AddIcon, Event as EventIcon } from '@mui/icons-material';
import { Alert, Box, Button, CircularProgress, Container, Paper, Typography, useTheme } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';

const Dashboard = () => {
  const navigate = useNavigate();
  const theme = useTheme();

  console.log('📍 Current Page: Dashboard Page');
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
      <Box sx={{
        p: 3,
        backgroundColor: theme.palette.background.default,
        minHeight: '100vh'
      }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{
      minHeight: '100vh',
      backgroundColor: theme.palette.background.default,
      px: { xs: 2, sm: 3 },
      py: { xs: 3, sm: 5 }
    }}>
      <Container maxWidth="lg">
        {/* Welcome Section */}
        <Paper sx={{
          mb: 4,
          p: { xs: 2, sm: 3 },
          backgroundColor: theme.palette.background.paper,
          borderRadius: 3,
          border: `1px solid ${theme.palette.divider}`,
          boxShadow: theme.palette.mode === 'dark'
            ? '0 4px 20px rgba(0,0,0,0.3)'
            : '0 4px 20px rgba(0,0,0,0.08)'
        }}>
          <Typography variant="h3" component="h1" sx={{
            fontWeight: 'bold',
            mb: 1,
            color: theme.palette.text.primary
          }}>
            Welcome back, {user?.name || 'User'}! 👋
          </Typography>
          <Typography variant="body1" sx={{
            color: theme.palette.text.secondary
          }}>
            Manage your events and collect feedback from attendees.
          </Typography>
        </Paper>

        {/* Action Cards - Responsive Layout */}
        <Box sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          justifyContent: 'center',
          alignItems: 'center',
          gap: 3,
          maxWidth: 'lg',
          mx: 'auto'
        }}>
          {/* Create Event */}
          <Paper sx={{
            width: '100%',
            backgroundColor: theme.palette.background.paper,
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 3,
            p: 3,
            textAlign: 'center',
            boxShadow: theme.palette.mode === 'dark'
              ? '0 4px 20px rgba(0,0,0,0.3)'
              : '0 4px 20px rgba(0,0,0,0.08)',
            transition: 'transform 0.3s ease',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: theme.palette.mode === 'dark'
                ? '0 6px 24px rgba(0,0,0,0.4)'
                : '0 6px 24px rgba(0,0,0,0.12)'
            }
          }}>
            <Typography variant="h6" sx={{
              fontWeight: 'bold',
              mb: 2,
              color: theme.palette.text.primary
            }}>
              Create New Event
            </Typography>
            <Button
              onClick={() => navigate('/add-event')}
              variant="contained"
              startIcon={<AddIcon />}
              sx={{
                backgroundColor: theme.palette.mode === 'dark' ? '#7C3AED' : '#8B5CF6',
                '&:hover': {
                  backgroundColor: theme.palette.mode === 'dark' ? '#6D28D9' : '#7C3AED'
                }
              }}
            >
              Add Event
            </Button>
          </Paper>

          {/* View Events */}
          <Paper sx={{
            width: '100%',
            backgroundColor: theme.palette.background.paper,
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 3,
            p: 3,
            textAlign: 'center',
            boxShadow: theme.palette.mode === 'dark'
              ? '0 4px 20px rgba(0,0,0,0.3)'
              : '0 4px 20px rgba(0,0,0,0.08)',
            transition: 'transform 0.3s ease',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: theme.palette.mode === 'dark'
                ? '0 6px 24px rgba(0,0,0,0.4)'
                : '0 6px 24px rgba(0,0,0,0.12)'
            }
          }}>
            <Typography variant="h6" sx={{
              fontWeight: 'bold',
              mb: 2,
              color: theme.palette.text.primary
            }}>
              View Event List
            </Typography>
            <Button
              onClick={() => navigate('/my-events')}
              variant="contained"
              startIcon={<EventIcon />}
              sx={{
                backgroundColor: theme.palette.mode === 'dark' ? '#0D9488' : '#14B8A6',
                '&:hover': {
                  backgroundColor: theme.palette.mode === 'dark' ? '#0F766E' : '#0D9488'
                }
              }}
            >
              View Events
            </Button>
          </Paper>
        </Box>
      </Container>
    </Box>
  );
};

export default Dashboard;
