import {
  Close,
  PhotoCamera,
  Save,
} from '@mui/icons-material';
import {
  Alert,
  Avatar,
  Box,
  Button,
  CircularProgress,
  IconButton,
  Modal,
  TextField,
  Typography,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { clearError, getProfile, updateProfilePicture } from '../redux/slices/authSlice';

const ProfileModal = ({ open, onClose }) => {
  const dispatch = useDispatch();
  const { user, loading, error } = useSelector((state) => state.auth);

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (open) {
      dispatch(clearError());
      // Only fetch profile if we don't have complete user data
      if (!user?.email || !user?.createdAt) {
        dispatch(getProfile());
      }
    }
  }, [open, dispatch, user]);

  useEffect(() => {
    if (selectedFile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      setPreviewUrl(null);
    }
  }, [selectedFile]);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    try {
      await dispatch(updateProfilePicture(selectedFile)).unwrap();
      setSelectedFile(null);
      setPreviewUrl(null);
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="profile-modal-title"
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
      }}
    >
      <Box
        sx={{
          background: 'rgba(255,255,255,0.9)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255,255,255,0.18)',
          boxShadow: '0 8px 32px 0 rgba(31,38,135,0.37)',
          borderRadius: 3,
          p: 4,
          width: '100%',
          maxWidth: 500,
          maxHeight: '90vh',
          overflow: 'auto',
          position: 'relative',
        }}
      >
        <IconButton
          onClick={handleClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: '#1a1a1a',
          }}
        >
          <Close />
        </IconButton>

        <Typography
          id="profile-modal-title"
          variant="h4"
          component="h2"
          align="center"
          gutterBottom
          sx={{ fontWeight: 'bold', color: '#1a1a1a', mb: 3 }}
        >
          Profile
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {/* Profile Picture Section */}
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Box sx={{ position: 'relative', display: 'inline-block' }}>
                <Avatar
                  src={previewUrl || user?.profilePic}
                  alt={user?.name}
                  sx={{
                    width: 120,
                    height: 120,
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

              {selectedFile && (
                <Box sx={{ mt: 2 }}>
                  <Button
                    variant="contained"
                    onClick={handleUpload}
                    disabled={uploading}
                    startIcon={uploading ? <CircularProgress size={20} /> : <Save />}
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
                    {uploading ? 'Uploading...' : 'Save Picture'}
                  </Button>
                </Box>
              )}
            </Box>

            {/* User Details */}
            <Box sx={{ mb: 3 }}>
              <TextField
                fullWidth
                label="Name"
                value={user?.name || ''}
                margin="normal"
                disabled
                sx={{ mb: 2 }}
              />

              <TextField
                fullWidth
                label="Email"
                value={user?.email || ''}
                margin="normal"
                disabled
                sx={{ mb: 2 }}
              />

              <TextField
                fullWidth
                label="Member Since"
                value={user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : ''}
                margin="normal"
                disabled
              />
            </Box>
          </>
        )}
      </Box>
    </Modal>
  );
};

export default ProfileModal; 