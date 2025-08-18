import {
  Clear as ClearIcon,
  FilterList as FilterIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Fade,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axiosInstance';
import EventCard from '../components/EventCard';

const Events = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  
  console.log('📍 Current Page: Events Page');
  const { user } = useSelector((state) => state.auth);
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [searchTerm, setSearchTerm] = useState('');
  const [priceFilter, setPriceFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    filterEvents();
  }, [events, searchTerm, priceFilter, dateFilter]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/events/public');
      setEvents(response.data);
    } catch (err) {
      setError('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const filterEvents = () => {
    let filtered = [...events];
    if (user) {
      filtered = filtered.filter((event) => event.owner?.id !== user.id);
    }

    if (searchTerm) {
      filtered = filtered.filter((event) =>
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.owner?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (priceFilter === 'free') {
      filtered = filtered.filter((event) => !event.ticketPrice || event.ticketPrice === 0);
    } else if (priceFilter === 'paid') {
      filtered = filtered.filter((event) => event.ticketPrice && event.ticketPrice > 0);
    }

    const now = new Date();
    if (dateFilter === 'upcoming') {
      filtered = filtered.filter((event) => new Date(event.date) > now);
    } else if (dateFilter === 'past') {
      filtered = filtered.filter((event) => new Date(event.date) < now);
    }

    setFilteredEvents(filtered);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setPriceFilter('all');
    setDateFilter('all');
  };

  const handleEventClick = (eventId) => {
    navigate(`/events/${eventId}`);
  };

  if (loading) {
    return (
      <Box sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: theme.palette.background.default,
      }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box sx={{
      minHeight: '100vh',
      backgroundColor: theme.palette.background.default,
      py: 10,
      px: 2
    }}>
      <Container maxWidth="xl">
        {/* Header */}
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 'bold',
              color: theme.palette.text.primary,
              mb: 2,
              fontSize: { xs: '2rem', sm: '3rem', md: '4rem' },
              transition: 'all 0.3s ease-in-out',
            }}
          >
            Discover Events
          </Typography>
          <Typography variant="h6" sx={{
            color: theme.palette.text.secondary,
            mb: 3
          }}>
            Find amazing events happening around you
          </Typography>
        </Box>

        {/* Filters */}
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 4,
            background: theme.palette.mode === 'dark'
              ? 'rgba(255, 255, 255, 0.05)'
              : 'rgba(0, 0, 0, 0.02)',
            borderRadius: 3,
            border: `1px solid ${theme.palette.divider}`,
            boxShadow: theme.palette.mode === 'dark'
              ? '0 4px 20px rgba(0,0,0,0.3)'
              : '0 4px 20px rgba(0,0,0,0.05)',
            transition: '0.3s ease',
            '&:hover': {
              boxShadow: theme.palette.mode === 'dark'
                ? '0 6px 24px rgba(0,0,0,0.4)'
                : '0 6px 24px rgba(0,0,0,0.1)',
            },
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <FilterIcon sx={{ mr: 1, color: theme.palette.text.primary }} />
            <Typography variant="h6" sx={{
              fontWeight: 'bold',
              color: theme.palette.text.primary
            }}>
              Search & Filters
            </Typography>
          </Box>

          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search events, descriptions, or organizers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: theme.palette.text.secondary }} />,
                }}
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: theme.palette.background.paper,
                    '&:hover': {
                      backgroundColor: theme.palette.mode === 'dark'
                        ? 'rgba(255, 255, 255, 0.08)'
                        : 'rgba(0, 0, 0, 0.04)',
                    },
                  },
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Price</InputLabel>
                <Select
                  value={priceFilter}
                  label="Price"
                  onChange={(e) => setPriceFilter(e.target.value)}
                  sx={{
                    backgroundColor: theme.palette.background.paper,
                    '&:hover': {
                      backgroundColor: theme.palette.mode === 'dark'
                        ? 'rgba(255, 255, 255, 0.08)'
                        : 'rgba(0, 0, 0, 0.04)',
                    },
                  }}
                >
                  <MenuItem value="all">All Events</MenuItem>
                  <MenuItem value="free">Free Events</MenuItem>
                  <MenuItem value="paid">Paid Events</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Date</InputLabel>
                <Select
                  value={dateFilter}
                  label="Date"
                  onChange={(e) => setDateFilter(e.target.value)}
                  sx={{
                    backgroundColor: theme.palette.background.paper,
                    '&:hover': {
                      backgroundColor: theme.palette.mode === 'dark'
                        ? 'rgba(255, 255, 255, 0.08)'
                        : 'rgba(0, 0, 0, 0.04)',
                    },
                  }}
                >
                  <MenuItem value="all">All Dates</MenuItem>
                  <MenuItem value="upcoming">Upcoming</MenuItem>
                  <MenuItem value="past">Past Events</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={12} md={2}>
              <Button
                fullWidth
                variant="outlined"
                onClick={clearFilters}
                startIcon={<ClearIcon />}
                sx={{
                  color: theme.palette.text.primary,
                  borderColor: theme.palette.divider,
                  transition: 'all 0.3s',
                  '&:hover': {
                    backgroundColor: theme.palette.text.primary,
                    color: theme.palette.background.paper,
                    borderColor: theme.palette.text.primary,
                  },
                }}
              >
                Clear
              </Button>
            </Grid>
          </Grid>

          <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Showing {filteredEvents.length} of {events.length} events
            </Typography>
            {(searchTerm || priceFilter !== 'all' || dateFilter !== 'all') && (
              <Chip
                label="Filters applied"
                size="small"
                sx={{
                  backgroundColor: theme.palette.mode === 'dark'
                    ? 'rgba(255, 255, 255, 0.1)'
                    : 'rgba(0, 0, 0, 0.1)',
                  color: theme.palette.text.primary,
                }}
              />
            )}
          </Box>
        </Paper>

        {/* Error */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Events Grid */}
        {filteredEvents.length === 0 ? (
          <Paper
            sx={{
              p: 4,
              textAlign: 'center',
              background: theme.palette.mode === 'dark'
                ? 'rgba(255, 255, 255, 0.05)'
                : 'rgba(0, 0, 0, 0.02)',
              borderRadius: 3,
              border: `1px solid ${theme.palette.divider}`,
              transition: 'transform 0.3s ease',
              '&:hover': {
                transform: 'scale(1.01)',
              },
            }}
          >
            <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
              No events found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Try adjusting your search criteria or filters
            </Typography>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {filteredEvents.map((event, index) => (
              <Fade in timeout={300 + index * 100} key={event.id}>
                <Grid item xs={12} sm={6} md={4} lg={3}>
                  <Box
                    onClick={() => handleEventClick(event.id)}
                    sx={{
                      cursor: 'pointer',
                      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: theme.palette.mode === 'dark'
                          ? '0 10px 20px rgba(0,0,0,0.4)'
                          : '0 10px 20px rgba(0,0,0,0.2)',
                      },
                    }}
                  >
                    <EventCard event={event} />
                  </Box>
                </Grid>
              </Fade>
            ))}
          </Grid>
        )}
      </Container>
    </Box>
  );
};

export default Events;
