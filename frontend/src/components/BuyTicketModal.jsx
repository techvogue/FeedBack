import { Close as CloseIcon, Payment as PaymentIcon } from '@mui/icons-material';
import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
    Typography,
    useTheme,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import axiosInstance from '../api/axiosInstance';

const BuyTicketModal = ({ open, onClose, event, onSuccess }) => {
    const theme = useTheme();
    const [formData, setFormData] = useState({
        attendeeName: '',
        attendeeEmail: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Load user data when modal opens
    useEffect(() => {
        if (open) {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            setFormData({
                attendeeName: user.name || '',
                attendeeEmail: user.email || '',
            });
            setError('');
        }
    }, [open]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleBuyTicket = async () => {
        try {
            setLoading(true);
            setError('');

            // Validate form
            if (!formData.attendeeName.trim() || !formData.attendeeEmail.trim()) {
                setError('Please fill in all fields');
                return;
            }

            // Create Stripe checkout session
            const response = await axiosInstance.post('/tickets/create-checkout-session', {
                eventId: event.id,
                attendeeName: formData.attendeeName.trim(),
                attendeeEmail: formData.attendeeEmail.trim(),
            });

            if (!response.data.success) {
                setError(response.data.message || 'Failed to create checkout session');
                return;
            }

            // Redirect to Stripe Checkout
            window.location.href = response.data.sessionUrl;

        } catch (error) {
            console.error('Buy ticket error:', error);
            setError(error.response?.data?.message || 'Failed to process ticket purchase');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        if (!loading) {
            onClose();
        }
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 2,
                    backgroundColor: theme.palette.background.paper,
                },
            }}
        >
            <DialogTitle sx={{ pb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="h6" color="text.primary">
                        Buy Ticket
                    </Typography>
                    <Button
                        onClick={handleClose}
                        disabled={loading}
                        sx={{ minWidth: 'auto', p: 1 }}
                    >
                        <CloseIcon />
                    </Button>
                </Box>
            </DialogTitle>

            <DialogContent sx={{ pt: 2 }}>
                {/* Event Details */}
                <Box sx={{ mb: 3, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                    <Typography variant="h6" color="text.primary" gutterBottom>
                        {event.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                        {new Date(event.date).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                        })}
                    </Typography>
                    <Typography variant="h6" color="primary.main" fontWeight="bold">
                        ₹{event.ticketPrice}
                    </Typography>
                </Box>

                {/* Error Alert */}
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                {/* Form */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField
                        label="Attendee Name"
                        name="attendeeName"
                        value={formData.attendeeName}
                        onChange={handleInputChange}
                        fullWidth
                        required
                        disabled={loading}
                    />
                    <TextField
                        label="Attendee Email"
                        name="attendeeEmail"
                        type="email"
                        value={formData.attendeeEmail}
                        onChange={handleInputChange}
                        fullWidth
                        required
                        disabled={loading}
                    />
                </Box>

                {/* Payment Info */}
                <Box sx={{ mt: 3, p: 2, bgcolor: 'primary.light', borderRadius: 1 }}>
                    <Typography variant="body2" color="primary.contrastText">
                        💳 Secure payment powered by Stripe
                    </Typography>
                </Box>
            </DialogContent>

            <DialogActions sx={{ p: 3, pt: 1 }}>
                <Button
                    onClick={handleClose}
                    disabled={loading}
                    variant="outlined"
                >
                    Cancel
                </Button>
                <Button
                    onClick={handleBuyTicket}
                    disabled={loading || !formData.attendeeName.trim() || !formData.attendeeEmail.trim()}
                    variant="contained"
                    startIcon={loading ? <CircularProgress size={20} /> : <PaymentIcon />}
                    sx={{ minWidth: 120 }}
                >
                    {loading ? 'Processing...' : `Pay ₹${event.ticketPrice}`}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default BuyTicketModal;
