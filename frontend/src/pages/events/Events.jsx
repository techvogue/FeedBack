import {
  Clear as ClearIcon,
  FilterList as FilterIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Fade,
  FormControl,
  Grid,
  InputAdornment,
  InputLabel,
  MenuItem,
  Pagination,
  Paper,
  Select,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from '../../api/axiosInstance';
import EventCard from '../../components/events/EventCard';
import { getApiErrorMessage } from '../../utils/errorHandling';
import { notifyError } from '../../utils/notify';
import { setPageMeta } from '../../utils/seo';

const Events = () => {
  const EVENTS_PER_PAGE = 8;
  const navigate = useNavigate();
  const theme = useTheme();

  const { user } = useSelector((state) => state.auth);
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [page, setPage] = useState(1);

  const normalizedEvents = useMemo(
    () =>
      events.map((event) => ({
        event,
        searchable: `${event.title ?? ''} ${event.description ?? ''} ${event.owner?.name ?? ''}`.toLowerCase(),
      })),
    [events]
  );

  const filterControlSx = {
    '& .MuiOutlinedInput-root': {
      height: 56,
      backgroundColor: theme.palette.background.paper,
      color: theme.palette.text.primary,
      '&:hover': {
        backgroundColor: theme.palette.mode === 'dark'
          ? 'rgba(255, 255, 255, 0.08)'
          : 'rgba(0, 0, 0, 0.04)',
      },
    },
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    setPageMeta({
      title: 'Browse Events | Event Feedback',
      description: 'Discover upcoming and past events, apply filters, and access event details to submit feedback.',
    });
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 250);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/events/public');
      setEvents(response.data);
    } catch (err) {
      notifyError(getApiErrorMessage(err, 'Failed to load events'));
    } finally {
      setLoading(false);
    }
  };

  const filterEvents = useCallback(() => {
    const normalizedQuery = debouncedSearchTerm.trim().toLowerCase();
    let filtered = [...normalizedEvents];

    if (user) {
      filtered = filtered.filter(({ event }) => event.owner?.id !== user.id);
    }

    if (normalizedQuery) {
      filtered = filtered.filter(({ searchable }) => searchable.includes(normalizedQuery));
    }

    const now = new Date();
    if (dateFilter === 'upcoming') {
      filtered = filtered.filter(({ event }) => new Date(event.date) > now);
    } else if (dateFilter === 'past') {
      filtered = filtered.filter(({ event }) => new Date(event.date) < now);
    }

    setFilteredEvents(filtered.map(({ event }) => event));
  }, [dateFilter, debouncedSearchTerm, normalizedEvents, user]);

  useEffect(() => {
    filterEvents();
  }, [filterEvents]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearchTerm, dateFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredEvents.length / EVENTS_PER_PAGE));

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const paginatedEvents = useMemo(() => {
    const start = (page - 1) * EVENTS_PER_PAGE;
    return filteredEvents.slice(start, start + EVENTS_PER_PAGE);
  }, [filteredEvents, page]);

  const clearFilters = () => {
    setSearchTerm('');
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
      py: 6,
      px: 2
    }}>
      <Container maxWidth="xl">
        {/* Filters */}
        <Paper
          elevation={0}
          sx={{
            p: 3,

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
            <Grid item xs={12} sm={12} md={6}>
              <TextField
                fullWidth
                placeholder="Search events, descriptions, or organizers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: theme.palette.text.secondary }} />
                    </InputAdornment>
                  ),
                }}
                variant="outlined"
                sx={filterControlSx}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth>
                <InputLabel>Date</InputLabel>
                <Select
                  value={dateFilter}
                  label="Date"
                  onChange={(e) => setDateFilter(e.target.value)}
                  sx={filterControlSx}
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
                  height: 56,
                  color: theme.palette.text.primary,
                  borderColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.28)',
                  backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                  transition: 'all 0.3s',
                  '&:hover': {
                    backgroundColor: theme.palette.mode === 'dark'
                      ? 'rgba(255, 255, 255, 0.14)'
                      : 'rgba(0, 0, 0, 0.1)',
                    color: theme.palette.text.primary,
                    borderColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.4)',
                  },
                }}
              >
                Clear
              </Button>
            </Grid>
          </Grid>

          <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Showing {filteredEvents.length === 0 ? 0 : (page - 1) * EVENTS_PER_PAGE + 1}-{Math.min(page * EVENTS_PER_PAGE, filteredEvents.length)} of {filteredEvents.length} filtered events ({events.length} total)
            </Typography>
            {(searchTerm || dateFilter !== 'all') && (
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
          <>
            <Grid container spacing={3}>
              {paginatedEvents.map((event, index) => (
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

            {totalPages > 1 && (
              <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={(_, value) => setPage(value)}
                  color="primary"
                  shape="rounded"
                  size="large"
                />
              </Box>
            )}
          </>
        )}
      </Container>
    </Box>
  );
};

export default Events;
