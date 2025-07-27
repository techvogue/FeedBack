import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Divider,
  Paper,
  Avatar,
  IconButton,
} from '@mui/material';
import { Google, PhotoCamera } from '@mui/icons-material';
import { register, clearError } from '../redux/slices/authSlice';

const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { loading, error, isAuthenticated } = useSelector((state) => state.auth);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [profilePicture, setProfilePicture] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  useEffect(() => {
    if (profilePicture) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(profilePicture);
    } else {
      setPreviewUrl(null);
    }
  }, [profilePicture]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setProfilePicture(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      return;
    }

    const userData = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
    };

    // If profile picture is selected, add it to the form data
    if (profilePicture) {
      const formDataToSend = new FormData();
      formDataToSend.append('name', userData.name);
      formDataToSend.append('email', userData.email);
      formDataToSend.append('password', userData.password);
      formDataToSend.append('profilePicture', profilePicture);
      
      // We'll need to modify the register action to handle FormData
      dispatch(register(formDataToSend));
    } else {
      dispatch(register(userData));
    }
  };

  const handleGoogleLogin = () => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    window.location.href = `${apiUrl}/auth/google`;
  };

  const isFormValid = () => {
    return (
      formData.name &&
      formData.email &&
      formData.password &&
      formData.password === formData.confirmPassword
    );
  };

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
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
            background: 'rgba(255,255,255,0.9)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255,255,255,0.18)',
            boxShadow: '0 8px 32px 0 rgba(31,38,135,0.37)',
            borderRadius: 3,
          }}
        >
          <Typography
            variant="h3"
            component="h1"
            align="center"
            gutterBottom
            sx={{ fontWeight: 'bold', color: '#1a1a1a', mb: 4 }}
          >
            Create Account
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* Profile Picture Upload */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Box sx={{ position: 'relative', display: 'inline-block' }}>
              <Avatar
                src={previewUrl}
                alt="Profile"
                sx={{
                  width: 100,
                  height: 100,
                  border: '3px solid rgba(255,255,255,0.3)',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                }}
              />
              <input
                accept="image/*"
                style={{ display: 'none' }}
                id="profile-picture-input"
                type="file"
                onChange={handleFileSelect}
              />
              <label htmlFor="profile-picture-input">
                <IconButton
                  component="span"
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    background: 'rgba(255,255,255,0.9)',
                    border: '2px solid rgba(255,255,255,0.3)',
                    '&:hover': {
                      background: 'rgba(255,255,255,1)',
                    },
                  }}
                >
                  <PhotoCamera />
                </IconButton>
              </label>
            </Box>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
              {profilePicture ? profilePicture.name : 'Click to upload profile picture'}
            </Typography>
          </Box>

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Full Name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              margin="normal"
              required
              sx={{ mb: 3 }}
            />

            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              margin="normal"
              required
              sx={{ mb: 3 }}
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
              sx={{ mb: 3 }}
            />

            <TextField
              fullWidth
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              margin="normal"
              required
              error={formData.confirmPassword && formData.password !== formData.confirmPassword}
              helperText={
                formData.confirmPassword && formData.password !== formData.confirmPassword
                  ? 'Passwords do not match'
                  : ''
              }
              sx={{ mb: 4 }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={!isFormValid() || loading}
              sx={{
                mb: 3,
                py: 1.5,
                background: 'rgba(255,255,255,0.2)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(255,255,255,0.18)',
                color: '#1a1a1a',
                fontSize: '1.1rem',
                '&:hover': {
                  background: 'rgba(255,255,255,0.3)',
                },
                '&:disabled': {
                  background: 'rgba(255,255,255,0.1)',
                  color: 'rgba(0,0,0,0.3)',
                },
              }}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Create Account'
              )}
            </Button>
          </form>

          <Divider sx={{ my: 3 }}>
            <Typography variant="body2" color="textSecondary">
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
              borderColor: 'rgba(255,255,255,0.3)',
              color: '#1a1a1a',
              fontSize: '1.1rem',
              '&:hover': {
                borderColor: 'rgba(255,255,255,0.5)',
                background: 'rgba(255,255,255,0.1)',
              },
            }}
          >
            Continue with Google
          </Button>

          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body1" color="textSecondary">
              Already have an account?{' '}
              <Link
                to="/login"
                style={{
                  color: '#1976d2',
                  textDecoration: 'none',
                  fontWeight: 'bold',
                }}
              >
                Sign in here
              </Link>
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Register;
