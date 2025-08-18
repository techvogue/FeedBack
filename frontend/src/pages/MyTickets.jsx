import {
    CalendarToday as CalendarIcon,
    Cancel as CancelIcon,
    CheckCircle as CheckCircleIcon,
    Event as EventIcon,
    Person as PersonIcon,
    Receipt as ReceiptIcon,
    Schedule as ScheduleIcon,
    ConfirmationNumber as TicketIcon,
} from '@mui/icons-material';
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Grid,
    Typography,
    useTheme
} from '@mui/material';
import { motion } from 'framer-motion';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';

const MyTickets = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchTickets();
    }, []);

    const fetchTickets = async () => {
        try {
            setLoading(true);
            setError('');

            const response = await axiosInstance.get('/tickets/my-tickets');

            if (response.data.success) {
                setTickets(response.data.tickets);
            } else {
                setError(response.data.message || 'Failed to fetch tickets');
            }
        } catch (error) {
            console.error('Fetch tickets error:', error);
            setError(error.response?.data?.message || 'Failed to load tickets');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'CONFIRMED':
                return 'success';
            case 'PENDING':
                return 'warning';
            case 'CANCELLED':
                return 'error';
            case 'REFUNDED':
                return 'info';
            default:
                return 'default';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'CONFIRMED':
                return <CheckCircleIcon />;
            case 'PENDING':
                return <ScheduleIcon />;
            case 'CANCELLED':
                return <CancelIcon />;
            case 'REFUNDED':
                return <ReceiptIcon />;
            default:
                return <TicketIcon />;
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    if (loading) {
        return (
            <Box
                sx={{
                    py: 4,
                    px: { xs: 2, sm: 3, md: 4 },
                    backgroundColor: theme.palette.background.default,
                    minHeight: '100vh',
                    color: theme.palette.text.primary,
                    margin: 0,
                    width: '100%',
                    maxWidth: '100%',
                    boxSizing: 'border-box'
                }}
            >
                <Box sx={{ maxWidth: 'lg', mx: 'auto' }}>
                   

                    {/* Loading Animation */}
                    <Box sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        minHeight: '400px',
                        gap: 3
                    }}>
                        <motion.div
                            animate={{
                                rotate: 360,
                                scale: [1, 1.1, 1]
                            }}
                            transition={{
                                rotate: { duration: 2, repeat: Infinity, ease: "linear" },
                                scale: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
                            }}
                        >
                            <TicketIcon sx={{
                                fontSize: 80,
                                color: theme.palette.primary.main,
                                filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))'
                            }} />
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                        >
                            <Typography
                                variant="h5"
                                color="text.primary"
                                gutterBottom
                                sx={{ fontWeight: 'bold' }}
                            >
                                Loading Your Tickets...
                            </Typography>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1 }}
                        >
                            <CircularProgress
                                size={40}
                                thickness={4}
                                sx={{
                                    color: theme.palette.primary.main,
                                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'
                                }}
                            />
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1.5 }}
                        >
                            <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ textAlign: 'center', maxWidth: 300 }}
                            >
                                Please wait while we fetch your ticket information
                            </Typography>
                        </motion.div>
                    </Box>
                </Box>
            </Box>
        );
    }

    return (
        <Box
            sx={{
                py: 4,
                px: { xs: 2, sm: 3, md: 4 },
                backgroundColor: theme.palette.background.default,
                minHeight: '100vh',
                color: theme.palette.text.primary,
                margin: 0,
                width: '100%',
                maxWidth: '100%',
                boxSizing: 'border-box'
            }}
        >
            <Box sx={{ maxWidth: 'lg', mx: 'auto' }}>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                   

                    {/* Error Alert */}
                    {error && (
                        <Alert severity="error" sx={{ mb: 3 }}>
                            {error}
                        </Alert>
                    )}

                    {/* Tickets Grid */}
                    {tickets.length === 0 ? (
                        <Box sx={{ textAlign: 'center', py: 8 }}>
                            <TicketIcon sx={{ fontSize: 80, color: theme.palette.text.secondary, mb: 2, mt: 10, }} />
                            <Typography variant="h5" color="text.secondary" gutterBottom>
                                No Tickets Found
                            </Typography>
                            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                                You haven't purchased any tickets yet.
                            </Typography>
                            <Button
                                variant="contained"
                                onClick={() => navigate('/events')}
                                size="large"
                                sx={{
                                    backgroundColor: theme.palette.primary.main,
                                    '&:hover': {
                                        backgroundColor: theme.palette.primary.dark,
                                    },
                                }}
                            >
                                Browse Events
                            </Button>
                        </Box>
                    ) : (
                        <Grid container spacing={3}>
                            {tickets.map((ticket, index) => (
                                <Grid item xs={12} md={6} lg={4} key={ticket.id}>
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1, duration: 0.6 }}
                                    >
                                        <Card
                                            sx={{
                                                height: '100%',
                                                borderRadius: 3,
                                                backgroundColor: theme.palette.background.paper,
                                                boxShadow: theme.palette.mode === 'dark'
                                                    ? '0 8px 32px rgba(0,0,0,0.3)'
                                                    : '0 8px 32px rgba(0,0,0,0.1)',
                                                border: `1px solid ${theme.palette.divider}`,
                                                transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                                                '&:hover': {
                                                    transform: 'translateY(-4px)',
                                                    boxShadow: theme.palette.mode === 'dark'
                                                        ? '0 12px 40px rgba(0,0,0,0.4)'
                                                        : '0 12px 40px rgba(0,0,0,0.15)',
                                                },
                                            }}
                                        >
                                            <CardContent sx={{ p: 3 }}>
                                                {/* Event Image */}
                                                {ticket.event.bannerUrl && (
                                                    <Box
                                                        sx={{
                                                            width: '100%',
                                                            height: 120,
                                                            borderRadius: 2,
                                                            mb: 2,
                                                            backgroundImage: `url(${ticket.event.bannerUrl})`,
                                                            backgroundSize: 'cover',
                                                            backgroundPosition: 'center',
                                                            border: `1px solid ${theme.palette.divider}`,
                                                        }}
                                                    />
                                                )}

                                                {/* Event Title */}
                                                <Typography
                                                    variant="h6"
                                                    color="text.primary"
                                                    gutterBottom
                                                    sx={{ fontWeight: 'bold', mb: 1 }}
                                                >
                                                    <EventIcon sx={{ mr: 1, verticalAlign: 'middle', fontSize: 20, color: theme.palette.primary.main }} />
                                                    {ticket.event.title}
                                                </Typography>

                                                {/* Event Date */}
                                                <Typography
                                                    variant="body2"
                                                    color="text.secondary"
                                                    sx={{ mb: 2, display: 'flex', alignItems: 'center' }}
                                                >
                                                    <CalendarIcon sx={{ mr: 1, fontSize: 16, color: theme.palette.text.secondary }} />
                                                    {formatDate(ticket.event.date)}
                                                </Typography>

                                                {/* Attendee Info */}
                                                <Box sx={{ mb: 2 }}>
                                                    <Typography
                                                        variant="body2"
                                                        color="text.secondary"
                                                        sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}
                                                    >
                                                        <PersonIcon sx={{ mr: 1, fontSize: 16, color: theme.palette.text.secondary }} />
                                                        {ticket.attendeeName}
                                                    </Typography>
                                                    <Typography
                                                        variant="body2"
                                                        color="text.secondary"
                                                        sx={{ fontSize: '0.875rem' }}
                                                    >
                                                        {ticket.attendeeEmail}
                                                    </Typography>
                                                </Box>

                                                {/* Ticket Details */}
                                                <Box sx={{ mb: 2 }}>
                                                    <Typography
                                                        variant="body2"
                                                        color="text.secondary"
                                                        sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}
                                                    >
                                                        <TicketIcon sx={{ mr: 1, fontSize: 16, color: theme.palette.text.secondary }} />
                                                        {ticket.ticketNumber}
                                                    </Typography>
                                                    <Typography
                                                        variant="body2"
                                                        color="text.secondary"
                                                        sx={{ display: 'flex', alignItems: 'center' }}
                                                    >
                                                        <ReceiptIcon sx={{ mr: 1, fontSize: 16, color: theme.palette.text.secondary }} />
                                                        ₹{ticket.ticketPrice}
                                                    </Typography>
                                                </Box>

                                                {/* Status */}
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <Chip
                                                        label={ticket.status}
                                                        color={getStatusColor(ticket.status)}
                                                        icon={getStatusIcon(ticket.status)}
                                                        size="small"
                                                        sx={{
                                                            backgroundColor: theme.palette[getStatusColor(ticket.status)]?.main,
                                                            color: theme.palette[getStatusColor(ticket.status)]?.contrastText,
                                                            '& .MuiChip-icon': {
                                                                color: 'inherit',
                                                            },
                                                        }}
                                                    />
                                                    <Typography variant="caption" color="text.secondary">
                                                        {formatDate(ticket.purchasedAt)}
                                                    </Typography>
                                                </Box>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                </Grid>
                            ))}
                        </Grid>
                    )}
                </motion.div>
            </Box>
        </Box>
    );
};

export default MyTickets;
