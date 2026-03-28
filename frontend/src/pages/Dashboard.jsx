import { Add as AddIcon, Event as EventIcon } from '@mui/icons-material';
import { Alert, Box, CircularProgress, List, ListItem, ListItemIcon, ListItemText, Typography, useTheme } from '@mui/material';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import axiosInstance from '../api/axiosInstance';
import AddEvent from './AddEvent';
import Events from './Events';

const Dashboard = () => {
  const theme = useTheme();

  console.log('📍 Current Page: Dashboard Page');
  const { user } = useSelector((state) => state.auth);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeView, setActiveView] = useState('dashboard');

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
      display: 'flex',
      minHeight: '100vh',
      backgroundColor: theme.palette.background.default
    }}>
      {/* Left Sidebar */}
      <Box sx={{
        width: { xs: 0, md: 240 },
        backgroundColor: theme.palette.background.paper,
        borderRight: `1px solid ${theme.palette.divider}`,
        p: { md: 3 },
        display: { xs: 'none', md: 'flex' },
        flexDirection: 'column',
        gap: 3,
        overflow: 'auto'
      }}>
        {/* Sidebar Navigation */}
        <List sx={{ p: 0 }}>
          {/* Dashboard */}
          <ListItem
            button
            onClick={() => setActiveView('dashboard')}
            sx={{
              pl: 2,
              pr: 2,
              py: 1.5,
              mb: 1,
              borderRadius: 1,
              cursor: 'pointer',
              backgroundColor: activeView === 'dashboard' ? 'rgba(139, 92, 246, 0.1)' : 'transparent',
              color: activeView === 'dashboard' ? theme.palette.primary.main : theme.palette.text.secondary,
              transition: 'all 0.2s ease',
              '&:hover': {
                backgroundColor: 'rgba(139, 92, 246, 0.08)',
                color: theme.palette.primary.main
              }
            }}
          >
            <ListItemIcon sx={{ minWidth: 40, color: 'inherit' }}>
              ▦
            </ListItemIcon>
            <ListItemText
              primary="Dashboard"
              primaryTypographyProps={{
                sx: {
                  fontSize: '0.95rem',
                  fontWeight: activeView === 'dashboard' ? 600 : 500
                }
              }}
            />
          </ListItem>

          {/* Events */}
          <ListItem
            button
            onClick={() => setActiveView('events')}
            sx={{
              pl: 2,
              pr: 2,
              py: 1.5,
              mb: 1,
              borderRadius: 1,
              cursor: 'pointer',
              backgroundColor: activeView === 'events' ? 'rgba(139, 92, 246, 0.1)' : 'transparent',
              color: activeView === 'events' ? theme.palette.primary.main : theme.palette.text.secondary,
              transition: 'all 0.2s ease',
              '&:hover': {
                backgroundColor: 'rgba(139, 92, 246, 0.08)',
                color: theme.palette.primary.main
              }
            }}
          >
            <ListItemIcon sx={{ minWidth: 40, color: 'inherit' }}>
              <EventIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText
              primary="Events"
              primaryTypographyProps={{
                sx: {
                  fontSize: '0.95rem',
                  fontWeight: activeView === 'events' ? 600 : 500
                }
              }}
            />
          </ListItem>

          {/* Create Event */}
          <ListItem
            button
            onClick={() => setActiveView('add-event')}
            sx={{
              pl: 2,
              pr: 2,
              py: 1.5,
              mb: 1,
              borderRadius: 1,
              cursor: 'pointer',
              backgroundColor: activeView === 'add-event' ? 'rgba(139, 92, 246, 0.1)' : 'transparent',
              color: activeView === 'add-event' ? theme.palette.primary.main : theme.palette.text.secondary,
              transition: 'all 0.2s ease',
              '&:hover': {
                backgroundColor: 'rgba(139, 92, 246, 0.08)',
                color: theme.palette.primary.main
              }
            }}
          >
            <ListItemIcon sx={{ minWidth: 40, color: 'inherit' }}>
              <AddIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText
              primary="Create Event"
              primaryTypographyProps={{
                sx: {
                  fontSize: '0.95rem',
                  fontWeight: activeView === 'add-event' ? 600 : 500
                }
              }}
            />
          </ListItem>
        </List>
      </Box>

      {/* Main Content */}
      <Box sx={{
        flexGrow: 1,
        overflow: 'auto',
        p: { xs: 2, sm: 3, md: 4 }
      }}>
        {/* Dashboard View */}
        {activeView === 'dashboard' && (
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 3 }}>
              Welcome back, {user?.name || 'User'}! 👋
            </Typography>

            {/* Dashboard Content */}
            <Events />
          </Box>
        )}

        {/* Events View */}
        {activeView === 'events' && (
          <Events />
        )}

        {/* Add Event View */}
        {activeView === 'add-event' && (
          <AddEvent />
        )}
      </Box>
    </Box>
  );
};

export default Dashboard;
