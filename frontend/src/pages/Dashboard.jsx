import { Add as AddIcon, Event as EventIcon, Menu as MenuIcon } from '@mui/icons-material';
import { Alert, Box, Button, CircularProgress, Drawer, IconButton, List, ListItem, ListItemIcon, ListItemText, Paper, Typography, useTheme } from '@mui/material';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import AddEvent from './AddEvent';
import Events from './Events';

const Dashboard = () => {
  const navigate = useNavigate();
  const theme = useTheme();

  console.log('📍 Current Page: Dashboard Page');
  const { user } = useSelector((state) => state.auth);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeView, setActiveView] = useState('dashboard');
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

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
      {/* Left Drawer/Sidebar */}
      <Drawer
        variant={{ xs: 'temporary', md: 'permanent' }}
        open={mobileDrawerOpen}
        onClose={() => setMobileDrawerOpen(false)}
        sx={{
          width: { md: 280 },
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: { xs: '100%', md: 280 },
            boxSizing: 'border-box',
            backgroundColor: theme.palette.background.paper,
            borderRight: `1px solid ${theme.palette.divider}`,
            pt: 2
          }
        }}
      >
        {/* Drawer Header */}
        <Box sx={{ px: 2, mb: 3 }}>
          <Typography variant="h6" sx={{
            fontWeight: 'bold',
            color: theme.palette.text.primary
          }}>
            Dashboard
          </Typography>
        </Box>

        {/* Navigation List */}
        <List>
          {/* Dashboard Item */}
          <ListItem
            button
            selected={activeView === 'dashboard'}
            onClick={() => {
              setActiveView('dashboard');
              setMobileDrawerOpen(false);
            }}
            sx={{
              backgroundColor: activeView === 'dashboard' ? 'rgba(139, 92, 246, 0.1)' : 'transparent',
              borderLeft: activeView === 'dashboard' ? `3px solid ${theme.palette.primary.main}` : 'none',
              pl: activeView === 'dashboard' ? '12px' : 2,
              mb: 1,
              '&:hover': {
                backgroundColor: 'rgba(139, 92, 246, 0.08)'
              }
            }}
          >
            <ListItemIcon sx={{
              color: activeView === 'dashboard' ? theme.palette.primary.main : theme.palette.text.secondary,
              minWidth: 40
            }}>
              📊
            </ListItemIcon>
            <ListItemText
              primary="Dashboard"
              sx={{
                '& .MuiListItemText-primary': {
                  color: activeView === 'dashboard' ? theme.palette.primary.main : theme.palette.text.primary,
                  fontWeight: activeView === 'dashboard' ? 600 : 500
                }
              }}
            />
          </ListItem>

          {/* Events Item */}
          <ListItem
            button
            selected={activeView === 'events'}
            onClick={() => {
              setActiveView('events');
              setMobileDrawerOpen(false);
            }}
            sx={{
              backgroundColor: activeView === 'events' ? 'rgba(139, 92, 246, 0.1)' : 'transparent',
              borderLeft: activeView === 'events' ? `3px solid ${theme.palette.primary.main}` : 'none',
              pl: activeView === 'events' ? '12px' : 2,
              mb: 1,
              '&:hover': {
                backgroundColor: 'rgba(139, 92, 246, 0.08)'
              }
            }}
          >
            <ListItemIcon sx={{
              color: activeView === 'events' ? theme.palette.primary.main : theme.palette.text.secondary,
              minWidth: 40
            }}>
              <EventIcon />
            </ListItemIcon>
            <ListItemText
              primary="View Events"
              sx={{
                '& .MuiListItemText-primary': {
                  color: activeView === 'events' ? theme.palette.primary.main : theme.palette.text.primary,
                  fontWeight: activeView === 'events' ? 600 : 500
                }
              }}
            />
          </ListItem>

          {/* Create Event Item */}
          <ListItem
            button
            selected={activeView === 'add-event'}
            onClick={() => {
              setActiveView('add-event');
              setMobileDrawerOpen(false);
            }}
            sx={{
              backgroundColor: activeView === 'add-event' ? 'rgba(139, 92, 246, 0.1)' : 'transparent',
              borderLeft: activeView === 'add-event' ? `3px solid ${theme.palette.primary.main}` : 'none',
              pl: activeView === 'add-event' ? '12px' : 2,
              mb: 1,
              '&:hover': {
                backgroundColor: 'rgba(139, 92, 246, 0.08)'
              }
            }}
          >
            <ListItemIcon sx={{
              color: activeView === 'add-event' ? theme.palette.primary.main : theme.palette.text.secondary,
              minWidth: 40
            }}>
              <AddIcon />
            </ListItemIcon>
            <ListItemText
              primary="Create Event"
              sx={{
                '& .MuiListItemText-primary': {
                  color: activeView === 'add-event' ? theme.palette.primary.main : theme.palette.text.primary,
                  fontWeight: activeView === 'add-event' ? 600 : 500
                }
              }}
            />
          </ListItem>
        </List>
      </Drawer>

      {/* Main Content Area */}
      <Box sx={{
        flexGrow: 1,
        overflow: 'auto'
      }}>
        {/* Mobile Header with Menu Button */}
        <Box sx={{
          display: { md: 'none' },
          p: 2,
          borderBottom: `1px solid ${theme.palette.divider}`,
          backgroundColor: theme.palette.background.paper
        }}>
          <IconButton
            onClick={() => setMobileDrawerOpen(true)}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="span">
            Dashboard
          </Typography>
        </Box>

        {/* Content */}
        <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
          {/* Dashboard View */}
          {activeView === 'dashboard' && (
            <Box>
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

              {/* Quick Stats/Dashboard Content */}
              <Box sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' },
                gap: 2,
                mb: 4
              }}>
                {dashboardData && (
                  <>
                    <Paper sx={{
                      p: 3,
                      textAlign: 'center',
                      backgroundColor: theme.palette.background.paper,
                      border: `1px solid ${theme.palette.divider}`,
                      borderRadius: 2
                    }}>
                      <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                        {dashboardData.totalEvents || 0}
                      </Typography>
                      <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                        Total Events
                      </Typography>
                    </Paper>
                    <Paper sx={{
                      p: 3,
                      textAlign: 'center',
                      backgroundColor: theme.palette.background.paper,
                      border: `1px solid ${theme.palette.divider}`,
                      borderRadius: 2
                    }}>
                      <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                        {dashboardData.totalFeedback || 0}
                      </Typography>
                      <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                        Total Feedback
                      </Typography>
                    </Paper>
                    <Paper sx={{
                      p: 3,
                      textAlign: 'center',
                      backgroundColor: theme.palette.background.paper,
                      border: `1px solid ${theme.palette.divider}`,
                      borderRadius: 2
                    }}>
                      <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                        {dashboardData.totalTickets || 0}
                      </Typography>
                      <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                        Total Tickets
                      </Typography>
                    </Paper>
                  </>
                )}
              </Box>

              {/* Quick Action Cards */}
              <Box sx={{
                display: 'flex',
                flexDirection: { xs: 'column', md: 'row' },
                gap: 3
              }}>
                {/* Create Event Card */}
                <Paper sx={{
                  flex: 1,
                  p: 3,
                  textAlign: 'center',
                  backgroundColor: theme.palette.background.paper,
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 2,
                  cursor: 'pointer',
                  transition: 'transform 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)'
                  }
                }}
                  onClick={() => setActiveView('add-event')}
                >
                  <AddIcon sx={{ fontSize: 40, mb: 1, color: theme.palette.primary.main }} />
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                    Create New Event
                  </Typography>
                  <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 2 }}>
                    Start creating a new event
                  </Typography>
                  <Button
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

                {/* View Events Card */}
                <Paper sx={{
                  flex: 1,
                  p: 3,
                  textAlign: 'center',
                  backgroundColor: theme.palette.background.paper,
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 2,
                  cursor: 'pointer',
                  transition: 'transform 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)'
                  }
                }}
                  onClick={() => setActiveView('events')}
                >
                  <EventIcon sx={{ fontSize: 40, mb: 1, color: theme.palette.primary.main }} />
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                    View Events
                  </Typography>
                  <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 2 }}>
                    Browse all your events
                  </Typography>
                  <Button
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
    </Box>
  );
};

export default Dashboard;
