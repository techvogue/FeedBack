import {
    ArrowBack as ArrowBackIcon,
    CheckCircle as CheckCircleIcon,
    Email as EmailIcon,
    Event as EventIcon,
    Home as HomeIcon,
    Person as PersonIcon,
    Receipt as ReceiptIcon,
} from '@mui/icons-material';
import {
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Container,
    Divider,
    Grid,
    Paper,
    Typography,
    useTheme,
} from '@mui/material';
import { motion } from 'framer-motion';
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';

const ThankYouPage = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const location = useLocation();
    const [ticket, setTicket] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const verifyPayment = async () => {
            try {
                console.log('🔍 ThankYouPage: Starting payment verification...');
                console.log('🔍 ThankYouPage: Full URL:', window.location.href);
                console.log('🔍 ThankYouPage: Search params:', window.location.search);

                const urlParams = new URLSearchParams(location.search);
                const sessionId = urlParams.get('session_id');
                const ticketId = urlParams.get('ticket_id');

                console.log('🔍 ThankYouPage: URL params:', { sessionId, ticketId });
                console.log('🔍 ThankYouPage: All URL params:', Object.fromEntries(urlParams.entries()));

                if (sessionId && ticketId) {
                    console.log('🔍 ThankYouPage: Calling verify-payment endpoint...');
                    // Verify payment with backend
                    const response = await axiosInstance.get(`/tickets/verify-payment?session_id=${sessionId}&ticket_id=${ticketId}`);

                    console.log('🔍 ThankYouPage: Response received:', response.data);

                    if (response.data.success) {
                        console.log('✅ ThankYouPage: Payment verified successfully');
                        setTicket(response.data.ticket);
                        // Store in localStorage for persistence
                        localStorage.setItem('lastTicket', JSON.stringify(response.data.ticket));
                    } else {
                        console.log('❌ ThankYouPage: Payment verification failed:', response.data);
                        setError(`Payment verification failed: ${response.data.message}`);
                    }
                } else {
                    console.log('🔍 ThankYouPage: No URL params, checking localStorage...');
                    // Try to get from localStorage if no URL params
                    const savedTicket = JSON.parse(localStorage.getItem('lastTicket') || 'null');
                    if (savedTicket) {
                        console.log('✅ ThankYouPage: Found ticket in localStorage');
                        setTicket(savedTicket);
                    } else {
                        console.log('❌ ThankYouPage: No ticket found in localStorage');
                        setError('No ticket information found. Payment verification failed.');
                    }
                }
            } catch (error) {
                console.error('💥 ThankYouPage: Payment verification error:', error);
                console.error('💥 Error details:', {
                    message: error.message,
                    response: error.response?.data,
                    status: error.response?.status
                });
                setError(`Failed to verify payment: ${error.response?.data?.message || error.message}`);
            } finally {
                setLoading(false);
            }
        };

        verifyPayment();
    }, [location.search]);

    const handleGoHome = () => {
        navigate('/');
    };

    const handleGoBack = () => {
        navigate(-1);
    };

    const handleViewTickets = () => {
        navigate('/my-tickets');
    };

    if (loading) {
        return (
            <Container maxWidth="md" sx={{ py: 8 }}>
                <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="text.primary" gutterBottom>
                        Verifying Payment...
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                        Please wait while we confirm your payment.
                    </Typography>
                </Box>
            </Container>
        );
    }

    if (error || !ticket) {
        return (
            <Container maxWidth="md" sx={{ py: 8 }}>
                <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="text.primary" gutterBottom>
                        {error || 'Ticket Not Found'}
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                        {error || 'Unable to display ticket information.'}
                    </Typography>
                    <Button
                        variant="contained"
                        onClick={handleGoHome}
                        startIcon={<HomeIcon />}
                    >
                        Go Home
                    </Button>
                </Box>
            </Container>
        );
    }

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                {/* Success Header */}
                <Box sx={{ textAlign: 'center', mb: 6 }}>
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                    >
                        <CheckCircleIcon
                            sx={{
                                fontSize: 80,
                                color: theme.palette.success.main,
                                mb: 2,
                            }}
                        />
                    </motion.div>
                    <Typography
                        variant="h3"
                        color="text.primary"
                        gutterBottom
                        sx={{ fontWeight: 'bold' }}
                    >
                        Thank You!
                    </Typography>
                    <Typography
                        variant="h6"
                        color="text.secondary"
                        sx={{ mb: 2 }}
                    >
                        Your ticket has been successfully purchased
                    </Typography>
                    <Chip
                        label="Payment Successful"
                        color="success"
                        variant="outlined"
                        icon={<CheckCircleIcon />}
                    />
                </Box>

                {/* Ticket Details Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                >
                    <Card
                        sx={{
                            mb: 4,
                            borderRadius: 3,
                            boxShadow: theme.palette.mode === 'dark'
                                ? '0 8px 32px rgba(0,0,0,0.3)'
                                : '0 8px 32px rgba(0,0,0,0.1)',
                            border: `2px solid ${theme.palette.success.main}`,
                        }}
                    >
                        <CardContent sx={{ p: 4 }}>
                            {/* Event Details */}
                            <Box sx={{ mb: 3 }}>
                                <Typography
                                    variant="h5"
                                    color="text.primary"
                                    gutterBottom
                                    sx={{ fontWeight: 'bold' }}
                                >
                                    <EventIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                                    {ticket.eventTitle}
                                </Typography>
                                <Typography
                                    variant="body1"
                                    color="text.secondary"
                                    sx={{ mb: 2 }}
                                >
                                    {new Date(ticket.eventDate).toLocaleDateString('en-US', {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })}
                                </Typography>
                            </Box>

                            <Divider sx={{ my: 3 }} />

                            {/* Ticket Information */}
                            <Grid container spacing={3}>
                                <Grid item xs={12} md={6}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                        <PersonIcon sx={{ mr: 2, color: 'primary.main' }} />
                                        <Box>
                                            <Typography variant="body2" color="text.secondary">
                                                Attendee Name
                                            </Typography>
                                            <Typography variant="body1" color="text.primary" fontWeight="medium">
                                                {ticket.attendeeName}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                        <EmailIcon sx={{ mr: 2, color: 'primary.main' }} />
                                        <Box>
                                            <Typography variant="body2" color="text.secondary">
                                                Email
                                            </Typography>
                                            <Typography variant="body1" color="text.primary" fontWeight="medium">
                                                {ticket.attendeeEmail}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                        <ReceiptIcon sx={{ mr: 2, color: 'primary.main' }} />
                                        <Box>
                                            <Typography variant="body2" color="text.secondary">
                                                Ticket Number
                                            </Typography>
                                            <Typography variant="body1" color="text.primary" fontWeight="medium">
                                                {ticket.ticketNumber}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                        <ReceiptIcon sx={{ mr: 2, color: 'primary.main' }} />
                                        <Box>
                                            <Typography variant="body2" color="text.secondary">
                                                Amount Paid
                                            </Typography>
                                            <Typography variant="body1" color="text.primary" fontWeight="medium">
                                                ₹{ticket.ticketPrice}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Grid>
                            </Grid>

                            {/* Status */}
                            <Box sx={{ mt: 3, textAlign: 'center' }}>
                                <Chip
                                    label={ticket.status}
                                    color="success"
                                    variant="filled"
                                    sx={{ fontSize: '1rem', py: 1 }}
                                />
                            </Box>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Action Buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.6 }}
                >
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center' }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            A confirmation email has been sent to {ticket.attendeeEmail}
                        </Typography>

                        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
                            <Button
                                variant="outlined"
                                onClick={handleGoBack}
                                startIcon={<ArrowBackIcon />}
                                size="large"
                            >
                                Go Back
                            </Button>
                            <Button
                                variant="contained"
                                onClick={handleViewTickets}
                                size="large"
                            >
                                View My Tickets
                            </Button>
                            <Button
                                variant="contained"
                                onClick={handleGoHome}
                                startIcon={<HomeIcon />}
                                size="large"
                            >
                                Go Home
                            </Button>
                        </Box>
                    </Box>
                </motion.div>

                {/* Additional Info */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8, duration: 0.6 }}
                >
                    <Paper
                        sx={{
                            mt: 6,
                            p: 3,
                            bgcolor: 'background.default',
                            borderRadius: 2,
                        }}
                    >
                        <Typography variant="h6" color="text.primary" gutterBottom>
                            What's Next?
                        </Typography>
                        <Typography variant="body2" color="text.secondary" paragraph>
                            • You'll receive a confirmation email with your ticket details
                        </Typography>
                        <Typography variant="body2" color="text.secondary" paragraph>
                            • Save your ticket number for entry at the event
                        </Typography>
                        <Typography variant="body2" color="text.secondary" paragraph>
                            • You can view and manage your tickets in your account
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            • Don't forget to provide feedback after the event!
                        </Typography>
                    </Paper>
                </motion.div>
            </motion.div>
        </Container>
    );
};

export default ThankYouPage;
