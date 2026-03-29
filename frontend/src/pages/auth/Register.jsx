import { PhotoCamera } from '@mui/icons-material';
import {
  Alert,
  Avatar,
  Box,
  Button,
  CircularProgress,
  Container,
  Divider,
  IconButton,
  Paper,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { FcGoogle } from 'react-icons/fc';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { buildApiUrl } from '../../api/axiosInstance';
import { clearError, register } from '../../redux/slices/authSlice';

const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const theme = useTheme();

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
    window.location.href = buildApiUrl('/auth/google');
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
                    border: `3px solid ${theme.palette.divider}`,
                    boxShadow: theme.palette.mode === 'dark'
                      ? '0 4px 16px rgba(0,0,0,0.3)'
                      : '0 4px 16px rgba(0,0,0,0.1)',
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
                      background: theme.palette.background.paper,
                      border: `2px solid ${theme.palette.divider}`,
                      cursor: 'pointer',
                      '&:hover': {
                        background: theme.palette.mode === 'dark'
                          ? 'rgba(255,255,255,0.08)'
                          : 'rgba(0,0,0,0.04)',
                      },
                    }}
                  >
                    <PhotoCamera />
                  </IconButton>
                </label>
              </Box>
              <Typography variant="body2" color={theme.palette.text.secondary} sx={{ mt: 1 }}>
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
                  backgroundColor: theme.palette.mode === 'dark' ? '#FFFFFF' : '#000000',
                  color: theme.palette.mode === 'dark' ? '#000000' : '#FFFFFF',
                  fontSize: '1.1rem',
                  cursor: 'pointer',
                  '&:hover': {
                    backgroundColor: theme.palette.mode === 'dark' ? '#FFFFFF' : '#000000',
                  },
                  '&:disabled': {
                    backgroundColor: theme.palette.mode === 'dark' ? '#FFFFFF' : '#000000',
                    color: theme.palette.mode === 'dark' ? '#000000' : '#FFFFFF',
                    opacity: 1,
                    cursor: 'not-allowed',
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
              <Typography variant="body2" color={theme.palette.text.secondary}>
                OR
              </Typography>
            </Divider>

            <Button
              fullWidth
              variant="outlined"
              startIcon={<FcGoogle />}
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
                Already have an account?{' '}
                <Link
                  to="/login"
                  style={{
                    color: theme.palette.primary.main,
                    textDecoration: 'none',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                  }}
                >
                  Sign in here
                </Link>
              </Typography>
            </Box>
          </Paper>
        </Box>
      </Container>
    </Box>
  );
};

export default Register;
