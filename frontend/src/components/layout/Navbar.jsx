import {
  AccountCircle,
  DarkMode,
  Dashboard,
  Event,
  Home,
  LightMode,
  Logout,
  Menu as MenuIcon,
  Person,
} from '@mui/icons-material';
import {
  AppBar,
  Avatar,
  Box,
  Button,
  Drawer,
  IconButton,
  Menu,
  Toolbar,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { useColorMode } from '../../context/useColorMode';
import { logout } from '../../redux/slices/authSlice';
import ProfileModal from './ProfileModal';

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const location = useLocation();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { mode, toggleColorMode } = useColorMode();

  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showNavbar, setShowNavbar] = useState(true);
  const lastScrollYRef = useRef(0);
  const rafIdRef = useRef(null);
  const isMobile = useMediaQuery('(max-width: 768px)');

  useEffect(() => {
    const handleScroll = () => {
      if (rafIdRef.current !== null) return;

      rafIdRef.current = window.requestAnimationFrame(() => {
        const currentScrollY = window.scrollY;
        const shouldShowNavbar = !(currentScrollY > lastScrollYRef.current && currentScrollY > 80);

        setShowNavbar((prev) => (prev === shouldShowNavbar ? prev : shouldShowNavbar));
        lastScrollYRef.current = currentScrollY;
        rafIdRef.current = null;
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafIdRef.current !== null) {
        window.cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, []);

  const handleMenu = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);
  const handleLogout = () => {
    dispatch(logout());
    handleClose();
    navigate('/');
  };
  const handleProfileClick = () => {
    setProfileModalOpen(true);
    handleClose();
  };

  const navItems = [
    { label: 'Home', icon: <Home />, path: '/' },
    { label: 'Events', icon: <Event />, path: '/events' },
    ...(isAuthenticated
      ? [
        { label: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
      ]
      : []),
  ];

  const NavButton = ({ item }) => {
    const isActive = location.pathname === item.path;
    return (
      <Button
        onClick={() => navigate(item.path)}
        variant="text"
        startIcon={item.icon}
        sx={{
          textTransform: 'none',
          fontWeight: isActive ? 'bold' : 'normal',
          color: isActive
            ? mode === 'dark' ? 'black' : 'white'
            : mode === 'dark'
              ? 'white'
              : 'black',
          backgroundColor: isActive
            ? mode === 'dark' ? 'white' : 'black'
            : 'transparent',
          borderRadius: 2,
          px: 2,
          py: 1,
          transition: 'all 0.3s ease',
          '&:hover': {
            backgroundColor: mode === 'dark' ? 'white' : 'black',
            color: mode === 'dark' ? 'black' : 'white',
            transform: 'translateY(-1px)',
            boxShadow: 2,
          },
          '&:active': {
            transform: 'translateY(0)',
          },
        }}
      >
        {item.label}
      </Button>
    );
  };

  return (
    <>
      <AppBar
        position="fixed"
        sx={{
          transform: showNavbar ? 'translateY(0)' : 'translateY(-100%)',
          transition: 'transform 0.3s ease-in-out',
          backgroundColor: mode === 'dark' ? 'black' : 'white',
          color: mode === 'dark' ? 'white' : 'black',
          backdropFilter: 'blur(8px)',
          borderBottom: `1px solid ${mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
          boxShadow: mode === 'dark' ? '0 2px 8px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.1)',
        }}
        elevation={0}
      >
        <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, md: 3 } }}>
          <Typography
            variant="h6"
            component="h1"
            sx={{
              fontWeight: 'bold',
              cursor: 'pointer',
              color: mode === 'dark' ? 'white' : 'black',
              '&:hover': {
                color: mode === 'dark' ? 'black' : 'white',
                backgroundColor: mode === 'dark' ? 'white' : 'black',
                transition: 'all 0.3s ease',
              },
            }}
            onClick={() => navigate('/')}
          >
            Event Feedback
          </Typography>

          {isMobile ? (
            <IconButton
              onClick={() => setDrawerOpen(true)}
              sx={{
                color: mode === 'dark' ? 'white' : 'black',
                '&:hover': {
                  backgroundColor: mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                },
              }}
            >
              <MenuIcon />
            </IconButton>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {navItems.map((item) => (
                  <NavButton item={item} key={item.label} />
                ))}
              </Box>

              <IconButton
                onClick={toggleColorMode}
                sx={{
                  color: mode === 'dark' ? 'white' : 'black',
                  backgroundColor: 'transparent',
                  borderRadius: 2,
                  '&:hover': {
                    backgroundColor: mode === 'dark' ? 'white' : 'black',
                    color: mode === 'dark' ? 'black' : 'white',
                    transform: 'scale(1.1)',
                    transition: 'all 0.3s ease',
                  },
                }}
              >
                {mode === 'dark' ? <LightMode /> : <DarkMode />}
              </IconButton>

              {isAuthenticated ? (
                <Box>
                  <IconButton
                    onClick={handleMenu}
                    sx={{
                      p: 0,
                      ml: 1,
                      '&:hover': {
                        transform: 'scale(1.05)',
                        transition: 'transform 0.3s ease',
                      },
                    }}
                  >
                    {user?.profilePic ? (
                      <Avatar src={user.profilePic} alt={user.name} />
                    ) : (
                      <Avatar sx={{
                        bgcolor: mode === 'dark' ? 'white' : 'black',
                        color: mode === 'dark' ? 'black' : 'white',
                      }}>
                        <AccountCircle />
                      </Avatar>
                    )}
                  </IconButton>
                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleClose}
                    slotProps={{
                      paper: {
                        sx: {
                          mt: 2,
                          backgroundColor: mode === 'dark' ? 'black' : 'white',
                          color: mode === 'dark' ? 'white' : 'black',
                          border: `1px solid ${mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                          boxShadow: mode === 'dark' ? '0 4px 20px rgba(0,0,0,0.5)' : '0 4px 20px rgba(0,0,0,0.15)',
                        }
                      }
                    }}
                  >
                    <Button
                      onClick={handleProfileClick}
                      fullWidth
                      startIcon={<Person />}
                      sx={{
                        justifyContent: 'flex-start',
                        px: 2,
                        py: 1,
                        color: mode === 'dark' ? 'white' : 'black',
                        '&:hover': {
                          backgroundColor: mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                        },
                      }}
                    >
                      Profile
                    </Button>
                    <Button
                      onClick={handleLogout}
                      fullWidth
                      startIcon={<Logout />}
                      sx={{
                        justifyContent: 'flex-start',
                        px: 2,
                        py: 1,
                        color: mode === 'dark' ? 'white' : 'black',
                        '&:hover': {
                          backgroundColor: mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                        },
                      }}
                    >
                      Logout
                    </Button>
                  </Menu>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Button
                    onClick={() => navigate('/login')}
                    variant="outlined"
                    size="small"
                    sx={{
                      color: mode === 'dark' ? 'white' : 'black',
                      borderColor: mode === 'dark' ? 'white' : 'black',
                      '&:hover': {
                        backgroundColor: mode === 'dark' ? 'white' : 'black',
                        color: mode === 'dark' ? 'black' : 'white',
                        borderColor: mode === 'dark' ? 'white' : 'black',
                      },
                    }}
                  >
                    Login
                  </Button>
                  <Button
                    onClick={() => navigate('/register')}
                    variant="contained"
                    size="small"
                    sx={{
                      backgroundColor: mode === 'dark' ? 'white' : 'black',
                      color: mode === 'dark' ? 'black' : 'white',
                      '&:hover': {
                        backgroundColor: mode === 'dark' ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.9)',
                        transform: 'translateY(-1px)',
                        boxShadow: 2,
                      },
                    }}
                  >
                    Sign Up
                  </Button>
                </Box>
              )}
            </Box>
          )}
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        slotProps={{
          paper: {
            sx: {
              backgroundColor: mode === 'dark' ? 'black' : 'white',
              color: mode === 'dark' ? 'white' : 'black',
              width: 256,
              p: 2,
            }
          }
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
          Menu
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {navItems.map((item) => (
            <Button
              key={item.label}
              onClick={() => { navigate(item.path); setDrawerOpen(false); }}
              startIcon={item.icon}
              fullWidth
              variant="text"
              sx={{
                justifyContent: 'flex-start',
                fontWeight: location.pathname === item.path ? 'bold' : 'normal',
                color: location.pathname === item.path
                  ? mode === 'dark' ? 'black' : 'white'
                  : mode === 'dark' ? 'white' : 'black',
                backgroundColor: location.pathname === item.path
                  ? mode === 'dark' ? 'white' : 'black'
                  : 'transparent',
                borderRadius: 2,
                '&:hover': {
                  backgroundColor: mode === 'dark' ? 'white' : 'black',
                  color: mode === 'dark' ? 'black' : 'white',
                },
              }}
            >
              {item.label}
            </Button>
          ))}

          <Button
            onClick={toggleColorMode}
            startIcon={mode === 'dark' ? <LightMode /> : <DarkMode />}
            fullWidth
            variant="text"
            sx={{
              justifyContent: 'flex-start',
              mt: 1,
              color: mode === 'dark' ? 'white' : 'black',
              backgroundColor: 'transparent',
              borderRadius: 2,
              '&:hover': {
                backgroundColor: mode === 'dark' ? 'white' : 'black',
                color: mode === 'dark' ? 'black' : 'white',
              },
            }}
          >
            {mode === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </Button>

          {isAuthenticated ? (
            <>
              <Button
                onClick={() => { handleProfileClick(); setDrawerOpen(false); }}
                startIcon={<Person />}
                fullWidth
                variant="text"
                sx={{
                  justifyContent: 'flex-start',
                  color: mode === 'dark' ? 'white' : 'black',
                  backgroundColor: 'transparent',
                  borderRadius: 2,
                  '&:hover': {
                    backgroundColor: mode === 'dark' ? 'white' : 'black',
                    color: mode === 'dark' ? 'black' : 'white',
                  },
                }}
              >
                Profile
              </Button>
              <Button
                onClick={() => { handleLogout(); setDrawerOpen(false); }}
                startIcon={<Logout />}
                fullWidth
                variant="text"
                sx={{
                  justifyContent: 'flex-start',
                  color: mode === 'dark' ? 'white' : 'black',
                  backgroundColor: 'transparent',
                  borderRadius: 2,
                  '&:hover': {
                    backgroundColor: mode === 'dark' ? 'white' : 'black',
                    color: mode === 'dark' ? 'black' : 'white',
                  },
                }}
              >
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button
                onClick={() => { navigate('/login'); setDrawerOpen(false); }}
                fullWidth
                variant="outlined"
                sx={{
                  mt: 1,
                  color: mode === 'dark' ? 'white' : 'black',
                  borderColor: mode === 'dark' ? 'white' : 'black',
                  '&:hover': {
                    backgroundColor: mode === 'dark' ? 'white' : 'black',
                    color: mode === 'dark' ? 'black' : 'white',
                    borderColor: mode === 'dark' ? 'white' : 'black',
                  },
                }}
              >
                Login
              </Button>
              <Button
                onClick={() => { navigate('/register'); setDrawerOpen(false); }}
                fullWidth
                variant="contained"
                sx={{
                  backgroundColor: mode === 'dark' ? 'white' : 'black',
                  color: mode === 'dark' ? 'black' : 'white',
                  '&:hover': {
                    backgroundColor: mode === 'dark' ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.9)',
                  },
                }}
              >
                Sign Up
              </Button>
            </>
          )}
        </Box>
      </Drawer>

      <ProfileModal
        open={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
      />
    </>
  );
};

export default Navbar;