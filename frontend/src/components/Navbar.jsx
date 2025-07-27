import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Avatar,
  Menu,
  MenuItem,
  Box,
  IconButton,
} from '@mui/material';
import {
  AccountCircle,
  Dashboard,
  Home,
  Logout,
  Person,
} from '@mui/icons-material';
import { logout } from '../redux/slices/authSlice';
import ProfileModal from './ProfileModal';

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    dispatch(logout());
    handleClose();
    navigate('/');
  };

  const handleProfileClick = () => {
    setProfileModalOpen(true);
    handleClose();
  };

  const handleAuthClick = () => {
    navigate('/login');
  };

  return (
    <>
      <AppBar
        position="static"
        sx={{
          background: 'rgba(255,255,255,0.3)',
          backdropFilter: 'blur(16px)',
          boxShadow: '0 8px 32px 0 rgba(31,38,135,0.37)',
          border: '1px solid rgba(255,255,255,0.18)',
        }}
      >
        <Toolbar>
          <Typography
            variant="h6"
            component="div"
            sx={{
              flexGrow: 1,
              fontWeight: 'bold',
              color: '#1a1a1a',
              cursor: 'pointer',
            }}
            onClick={() => navigate('/')}
          >
            Event Feedback
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button
              color="inherit"
              startIcon={<Home />}
              onClick={() => navigate('/')}
              sx={{
                color: '#1a1a1a',
                '&:hover': {
                  background: 'rgba(255,255,255,0.1)',
                },
              }}
            >
              Home
            </Button>

            {isAuthenticated && (
              <Button
                color="inherit"
                startIcon={<Dashboard />}
                onClick={() => navigate('/dashboard')}
                sx={{
                  color: '#1a1a1a',
                  '&:hover': {
                    background: 'rgba(255,255,255,0.1)',
                  },
                }}
              >
                Dashboard
              </Button>
            )}

            {isAuthenticated ? (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <IconButton
                  size="large"
                  aria-label="account of current user"
                  aria-controls="menu-appbar"
                  aria-haspopup="true"
                  onClick={handleMenu}
                  sx={{ color: '#1a1a1a' }}
                >
                  {user?.profilePic ? (
                    <Avatar
                      src={user.profilePic}
                      alt={user.name}
                      sx={{ width: 32, height: 32 }}
                    />
                  ) : (
                    <AccountCircle />
                  )}
                </IconButton>
                <Menu
                  id="menu-appbar"
                  anchorEl={anchorEl}
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                  }}
                  keepMounted
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  open={Boolean(anchorEl)}
                  onClose={handleClose}
                  PaperProps={{
                    sx: {
                      background: 'rgba(255,255,255,0.9)',
                      backdropFilter: 'blur(16px)',
                      border: '1px solid rgba(255,255,255,0.18)',
                      boxShadow: '0 8px 32px 0 rgba(31,38,135,0.37)',
                    },
                  }}
                >
                  <MenuItem onClick={handleProfileClick}>
                    <Person sx={{ mr: 1 }} />
                    Profile
                  </MenuItem>
                  <MenuItem onClick={handleLogout}>
                    <Logout sx={{ mr: 1 }} />
                    Logout
                  </MenuItem>
                </Menu>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/login')}
                  sx={{
                    borderColor: 'rgba(255,255,255,0.3)',
                    color: '#1a1a1a',
                    '&:hover': {
                      borderColor: 'rgba(255,255,255,0.5)',
                      background: 'rgba(255,255,255,0.1)',
                    },
                  }}
                >
                  Login
                </Button>
                <Button
                  variant="contained"
                  onClick={() => navigate('/register')}
                  sx={{
                    background: 'rgba(255,255,255,0.2)',
                    backdropFilter: 'blur(16px)',
                    border: '1px solid rgba(255,255,255,0.18)',
                    color: '#1a1a1a',
                    '&:hover': {
                      background: 'rgba(255,255,255,0.3)',
                    },
                  }}
                >
                  Sign Up
                </Button>
              </Box>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      <ProfileModal
        open={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
      />
    </>
  );
};

export default Navbar; 