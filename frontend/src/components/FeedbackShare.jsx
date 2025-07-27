import { ContentCopy as CopyIcon, Share as ShareIcon } from '@mui/icons-material';
import {
  Box,
  Button,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import { QRCodeSVG } from 'qrcode.react';
import React from 'react';

const FeedbackShare = ({ eventId }) => {
  const feedbackUrl = `${window.location.origin}/feedback/${eventId}`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(feedbackUrl);
      // Optionally show toast
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  const shareLink = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Event Feedback Form',
          text: 'Please provide your feedback for this event',
          url: feedbackUrl,
        });
      } catch (err) {
        console.error('Failed to share:', err);
      }
    } else {
      copyToClipboard();
    }
  };

  return (
    <Paper sx={{
      p: 3,
      background: 'rgba(255,255,255,0.98)',
      borderRadius: 3,
      boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
    }}>
      <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: '#2c3e50' }}>
        Share Feedback Form
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
        <Box sx={{ p: 2, background: 'white', borderRadius: 2, mb: 2 }}>
          <QRCodeSVG value={feedbackUrl} size={200} />
        </Box>
        <Typography variant="body2" sx={{ textAlign: 'center', color: '#7f8c8d' }}>
          Scan this QR code to access the feedback form
        </Typography>
      </Box>

      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" sx={{ mb: 1, fontWeight: 'medium', color: '#34495e' }}>
          Or share this link:
        </Typography>
        <TextField
          fullWidth
          value={feedbackUrl}
          variant="outlined"
          size="small"
          InputProps={{
            readOnly: true,
            endAdornment: (
              <Button
                onClick={copyToClipboard}
                startIcon={<CopyIcon />}
                size="small"
                sx={{ mr: 1 }}
              >
                Copy
              </Button>
            ),
          }}
        />
      </Box>

      <Button
        fullWidth
        variant="contained"
        startIcon={<ShareIcon />}
        onClick={shareLink}
        sx={{
          mt: 2,
          backgroundColor: '#3498db',
          '&:hover': { backgroundColor: '#2980b9' }
        }}
      >
        Share Link
      </Button>
    </Paper>
  );
};

export default FeedbackShare;
