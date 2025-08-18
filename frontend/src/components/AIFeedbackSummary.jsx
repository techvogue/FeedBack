// frontend/src/components/AIFeedbackSummary.jsx
import { Lightbulb, SmartToy, TrendingUp } from '@mui/icons-material';
import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  Paper,
  Typography,
  useTheme,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import axiosInstance from '../api/axiosInstance';

const AIFeedbackSummary = ({ eventId }) => {
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [aiStatus, setAiStatus] = useState(null);
  const [model, setModel] = useState(null);
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const theme = useTheme();
  const typingSpeed = 30; // milliseconds per character

  // Typewriter effect
  useEffect(() => {
    if (summary && !loading) {
      setIsTyping(true);
      setDisplayedText('');

      let index = 0;
      const timer = setInterval(() => {
        if (index < summary.length) {
          setDisplayedText(prev => prev + summary[index]);
          index++;
        } else {
          setIsTyping(false);
          clearInterval(timer);
        }
      }, typingSpeed);

      return () => clearInterval(timer);
    }
  }, [summary, loading]);

  useEffect(() => {
    const fetchAISummary = async () => {
      try {
        setLoading(true);
        setError(null);
        setDisplayedText('');
        setIsTyping(false);

        const response = await axiosInstance.get(`/ai-summary/${eventId}`);
        const { summary: aiSummary, aiStatus: status, model: aiModel } = response.data;

        setSummary(aiSummary);
        setAiStatus(status);
        setModel(aiModel);
      } catch (err) {
        console.error('AI Summary fetch error:', err);
        setError(err.response?.data?.message || 'Failed to load AI summary');
        setAiStatus('error');
      } finally {
        setLoading(false);
      }
    };

    if (eventId) {
      fetchAISummary();
    }
  }, [eventId]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'success':
        return 'success';
      case 'fallback':
        return 'warning';
      case 'error':
        return 'error';
      case 'no_data':
        return 'info';
      default:
        return 'default';
    }
  };

  const getStatusMessage = (status) => {
    switch (status) {
      case 'success':
        return 'AI Analysis Complete';
      case 'fallback':
        return 'Basic Summary (AI Unavailable)';
      case 'error':
        return 'Analysis Failed';
      case 'no_data':
        return 'No Feedback Data';
      default:
        return 'Processing';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <SmartToy color="success" />;
      case 'fallback':
        return <Lightbulb color="warning" />;
      case 'error':
        return <SmartToy color="error" />;
      case 'no_data':
        return <TrendingUp color="info" />;
      default:
        return <SmartToy />;
    }
  };

  if (loading) {
    return (
      <Paper
        sx={{
          p: 3,
          backgroundColor: theme.palette.background.paper,
          borderRadius: 2,
          border: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <CircularProgress size={24} />
          <Typography variant="h6" color="text.primary">
            Analyzing Feedback with AI...
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary">
          Gemini Flash AI is processing your feedback data
        </Typography>
      </Paper>
    );
  }

  if (error) {
    return (
      <Paper
        sx={{
          p: 3,
          backgroundColor: theme.palette.background.paper,
          borderRadius: 2,
          border: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Typography variant="body2" color="text.secondary">
          Unable to generate AI analysis. Please try again later.
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper
      sx={{
        p: 3,
        backgroundColor: theme.palette.background.paper,
        borderRadius: 2,
        border: `1px solid ${theme.palette.divider}`,
      }}
    >
      {/* Header with AI Status */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <SmartToy sx={{ fontSize: 28, color: theme.palette.primary.main }} />
          <Typography variant="h6" color="text.primary">
            AI Feedback Analysis
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Chip
            icon={getStatusIcon(aiStatus)}
            label={getStatusMessage(aiStatus)}
            color={getStatusColor(aiStatus)}
            size="small"
            variant="outlined"
          />
          {model && (
            <Chip
              label={`${model}`}
              size="small"
              variant="outlined"
              color="primary"
            />
          )}
        </Box>
      </Box>

      {/* AI Status Alert */}
      {aiStatus === 'fallback' && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>AI Analysis Unavailable:</strong> Showing basic summary.
            This may be due to API limits or temporary service issues.
          </Typography>
        </Alert>
      )}

      {aiStatus === 'no_data' && (
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>No Feedback Data:</strong> AI analysis will be available once feedback is submitted.
          </Typography>
        </Alert>
      )}

      {/* Summary Content with Typewriter Effect */}
      <Box
        sx={{
          backgroundColor: theme.palette.mode === 'dark'
            ? 'rgba(255,255,255,0.05)'
            : 'rgba(0,0,0,0.02)',
          borderRadius: 1,
          p: 2,
          border: `1px solid ${theme.palette.divider}`,
          minHeight: '200px',
        }}
      >
        <Typography
          variant="body1"
          sx={{
            whiteSpace: 'pre-line',
            lineHeight: 1.6,
            color: theme.palette.text.primary,
            '& strong': {
              color: theme.palette.primary.main,
              fontWeight: 600,
            },
            '& h1, & h2, & h3, & h4, & h5, & h6': {
              color: theme.palette.primary.main,
              fontWeight: 600,
              mt: 2,
              mb: 1,
            },
            '& ul, & ol': {
              pl: 2,
            },
            '& li': {
              mb: 0.5,
            },
            position: 'relative',
          }}
        >
          {displayedText}
          {/* Blinking cursor effect */}
          {isTyping && (
            <Box
              component="span"
              sx={{
                display: 'inline-block',
                width: '2px',
                height: '1.2em',
                backgroundColor: theme.palette.primary.main,
                animation: 'blink 1s infinite',
                verticalAlign: 'text-bottom',
                ml: 0.5,
                '@keyframes blink': {
                  '0%, 50%': {
                    opacity: 1,
                  },
                  '51%, 100%': {
                    opacity: 0,
                  },
                },
              }}
            />
          )}
        </Typography>

        {/* Typing indicator */}
        {isTyping && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
            <CircularProgress size={16} />
            <Typography variant="caption" color="text.secondary">
              AI is writing insights...
            </Typography>
          </Box>
        )}
      </Box>

      {/* Footer */}
      <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="caption" color="text.secondary">
          Powered by Google Gemini Flash AI
        </Typography>
        {aiStatus === 'success' && !isTyping && (
          <Chip
            label="Real-time Analysis"
            size="small"
            color="success"
            variant="outlined"
          />
        )}
      </Box>
    </Paper>
  );
};

export default AIFeedbackSummary;
