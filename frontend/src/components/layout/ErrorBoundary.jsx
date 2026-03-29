import { Box, Button, Paper, Typography } from '@mui/material';
import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        if (import.meta.env.DEV) {
            console.error('Unhandled UI error:', error, errorInfo);
        }
    }

    handleReload = () => {
        window.location.reload();
    };

    handleGoHome = () => {
        window.location.href = '/';
    };

    render() {
        if (!this.state.hasError) {
            return this.props.children;
        }

        return (
            <Box
                sx={{
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    p: 2,
                    backgroundColor: 'background.default'
                }}
            >
                <Paper sx={{ maxWidth: 560, width: '100%', p: 4, borderRadius: 2 }}>
                    <Typography variant="h5" sx={{ mb: 1, fontWeight: 700 }}>
                        Something went wrong
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                        The page hit an unexpected error. You can reload the app or return home.
                    </Typography>

                    {import.meta.env.DEV && this.state.error?.message && (
                        <Typography
                            variant="caption"
                            component="pre"
                            sx={{
                                display: 'block',
                                mb: 3,
                                whiteSpace: 'pre-wrap',
                                p: 1.5,
                                borderRadius: 1,
                                bgcolor: 'action.hover'
                            }}
                        >
                            {this.state.error.message}
                        </Typography>
                    )}

                    <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                        <Button variant="contained" onClick={this.handleReload}>
                            Reload
                        </Button>
                        <Button variant="outlined" onClick={this.handleGoHome}>
                            Go Home
                        </Button>
                    </Box>
                </Paper>
            </Box>
        );
    }
}

export default ErrorBoundary;
