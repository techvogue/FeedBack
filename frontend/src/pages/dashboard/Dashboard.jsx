import { Add as AddIcon, Dashboard as DashboardIcon, Event as EventIcon } from '@mui/icons-material';
import { Box, CircularProgress, List, ListItem, ListItemIcon, ListItemText, Paper, Typography, useTheme } from '@mui/material';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import { getApiErrorMessage } from '../../utils/errorHandling';
import { notifyError } from '../../utils/notify';
import AddEvent from '../events/AddEvent';
import MyEvents from '../events/MyEvents';

const Dashboard = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const { user } = useSelector((state) => state.auth);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  const currentPath = location.pathname.replace(/\/+$/, '');
  const isDashboardOverview = currentPath === '/dashboard';
  const isMyEvents = currentPath === '/dashboard/my-events';
  const isCreateEvent = currentPath === '/dashboard/create-event';

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get('/dashboard/data');
        setDashboardData(response.data);
      } catch (err) {
        notifyError(getApiErrorMessage(err, 'Failed to load dashboard data'));
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
            onClick={() => navigate('/dashboard')}
            sx={{
              pl: 2,
              pr: 2,
              py: 1.5,
              mb: 1,
              borderRadius: 1,
              cursor: 'pointer',
              backgroundColor: isDashboardOverview ? theme.palette.action.selected : 'transparent',
              color: isDashboardOverview ? theme.palette.primary.main : theme.palette.text.secondary,
              transition: 'all 0.2s ease',
              '&:hover': {
                backgroundColor: theme.palette.action.hover,
                color: theme.palette.primary.main
              }
            }}
          >
            <ListItemIcon sx={{ minWidth: 40, color: 'inherit' }}>
              <DashboardIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText
              primary="Dashboard"
              primaryTypographyProps={{
                sx: {
                  fontSize: '0.95rem',
                  fontWeight: isDashboardOverview ? 600 : 500
                }
              }}
            />
          </ListItem>

          {/* My Events */}
          <ListItem
            button
            onClick={() => navigate('/dashboard/my-events')}
            sx={{
              pl: 2,
              pr: 2,
              py: 1.5,
              mb: 1,
              borderRadius: 1,
              cursor: 'pointer',
              backgroundColor: isMyEvents ? theme.palette.action.selected : 'transparent',
              color: isMyEvents ? theme.palette.primary.main : theme.palette.text.secondary,
              transition: 'all 0.2s ease',
              '&:hover': {
                backgroundColor: theme.palette.action.hover,
                color: theme.palette.primary.main
              }
            }}
          >
            <ListItemIcon sx={{ minWidth: 40, color: 'inherit' }}>
              <EventIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText
              primary="My Events"
              primaryTypographyProps={{
                sx: {
                  fontSize: '0.95rem',
                  fontWeight: isMyEvents ? 600 : 500
                }
              }}
            />
          </ListItem>

          {/* Create Event */}
          <ListItem
            button
            onClick={() => navigate('/dashboard/create-event')}
            sx={{
              pl: 2,
              pr: 2,
              py: 1.5,
              mb: 1,
              borderRadius: 1,
              cursor: 'pointer',
              backgroundColor: isCreateEvent ? theme.palette.action.selected : 'transparent',
              color: isCreateEvent ? theme.palette.primary.main : theme.palette.text.secondary,
              transition: 'all 0.2s ease',
              '&:hover': {
                backgroundColor: theme.palette.action.hover,
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
                  fontWeight: isCreateEvent ? 600 : 500
                }
              }}
            />
          </ListItem>
        </List>
      </Box>

      {/* Main Content */}
      <Box sx={{
        flexGrow: 1,
        overflow: 'visible',
        p: isDashboardOverview ? { xs: 2, sm: 3, md: 4 } : 0
      }}>
        {/* Dashboard Overview */}
        {isDashboardOverview && (
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 3, color: theme.palette.text.primary }}>
              Welcome back, {user?.name || 'User'}
            </Typography>

            <Box sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
              gap: 2
            }}>
              <Paper sx={{ p: 3, border: `1px solid ${theme.palette.divider}`, borderRadius: 2 }}>
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                  {dashboardData?.totalEvents || 0}
                </Typography>
                <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                  Total Events
                </Typography>
              </Paper>

              <Paper sx={{ p: 3, border: `1px solid ${theme.palette.divider}`, borderRadius: 2 }}>
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                  {dashboardData?.totalFeedback || 0}
                </Typography>
                <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                  Total Feedback
                </Typography>
              </Paper>

            </Box>
          </Box>
        )}

        {/* My Events View */}
        {isMyEvents && (
          <MyEvents />
        )}

        {/* Add Event View */}
        {isCreateEvent && (
          <AddEvent />
        )}
      </Box>
    </Box>
  );
};

export default Dashboard;
