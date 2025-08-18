import { Google } from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Divider,
  Paper,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { clearError, login } from '../redux/slices/authSlice';

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  console.log('📍 Current Page: Login Page');
  const location = useLocation();
  const theme = useTheme();

  const { loading, error, isAuthenticated } = useSelector((state) => state.auth);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  useEffect(() => {
    if (isAuthenticated) {
      const urlParams = new URLSearchParams(location.search);
      const redirect = urlParams.get('redirect');

      if (redirect) {
        navigate(redirect, { replace: true });
      } else {
        const from = location.state?.from?.pathname || '/dashboard';
        navigate(from, { replace: true });
      }
    }
  }, [isAuthenticated, navigate, location]);

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(login(formData));
  };

  const handleGoogleLogin = () => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const urlParams = new URLSearchParams(location.search);
    const redirect = urlParams.get('redirect');

    const googleUrl = redirect
      ? `${apiUrl}/auth/google?redirect=${encodeURIComponent(redirect)}`
      : `${apiUrl}/auth/google`;

    window.location.href = googleUrl;
  };

  const isFormValid = () => {
    return formData.email && formData.password;
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      backgroundColor: theme.palette.background.default,
      py: 4,
      px: 2
    }}>
      <Container maxWidth="sm">
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            minHeight: '80vh',
            justifyContent: 'center',
          }}
        >
          <Paper
            sx={{
              p: 6,
              width: '100%',
              background: theme.palette.background.paper,
              backdropFilter: 'blur(16px)',
              border: `1px solid ${theme.palette.divider}`,
              boxShadow: theme.palette.mode === 'dark'
                ? '0 8px 32px rgba(0,0,0,0.3)'
                : '0 8px 32px rgba(0,0,0,0.1)',
              borderRadius: 3,
            }}
          >
          <Typography
            variant="h3"
            component="h1"
            align="center"
            gutterBottom
            sx={{ fontWeight: 'bold', color: theme.palette.text.primary, mb: 4 }}
          >
            Welcome Back
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              margin="normal"
              required
              sx={{ 
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  backgroundColor: theme.palette.background.paper,
                  '&:hover': {
                    backgroundColor: theme.palette.mode === 'dark'
                      ? 'rgba(255,255,255,0.08)'
                      : 'rgba(0,0,0,0.04)',
                  },
                },
              }}
            />

            <TextField
              fullWidth
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleInputChange}
              margin="normal"
              required
              sx={{ 
                mb: 4,
                '& .MuiOutlinedInput-root': {
                  backgroundColor: theme.palette.background.paper,
                  '&:hover': {
                    backgroundColor: theme.palette.mode === 'dark'
                      ? 'rgba(255,255,255,0.08)'
                      : 'rgba(0,0,0,0.04)',
                  },
                },
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={!isFormValid() || loading}
              sx={{
                mb: 3,
                py: 1.5,
                backgroundColor: theme.palette.primary.main,
                color: theme.palette.primary.contrastText,
                fontSize: '1.1rem',
                cursor: 'pointer',
                '&:hover': {
                  backgroundColor: theme.palette.primary.dark,
                },
                '&:disabled': {
                  backgroundColor: theme.palette.action.disabledBackground,
                  color: theme.palette.action.disabled,
                  cursor: 'not-allowed',
                },
              }}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          <Divider sx={{ my: 3 }}>
            <Typography variant="body2" color={theme.palette.text.secondary}>
              OR
            </Typography>
          </Divider>

          <Button
            fullWidth
            variant="outlined"
            startIcon={<Google />}
            onClick={handleGoogleLogin}
            sx={{
              mb: 4,
              py: 1.5,
              borderColor: theme.palette.divider,
              color: theme.palette.text.primary,
              fontSize: '1.1rem',
              cursor: 'pointer',
              '&:hover': {
                borderColor: theme.palette.text.primary,
                backgroundColor: theme.palette.mode === 'dark'
                  ? 'rgba(255,255,255,0.08)'
                  : 'rgba(0,0,0,0.04)',
              },
            }}
          >
            Continue with Google
          </Button>

          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body1" color={theme.palette.text.secondary}>
              Don't have an account?{' '}
              <Link
                to="/register"
                style={{
                  color: theme.palette.primary.main,
                  textDecoration: 'none',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                }}
              >
                Sign up here
              </Link>
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
    </Box>
  );
};

export default Login;
